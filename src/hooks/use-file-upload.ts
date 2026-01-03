import {
	type ChangeEvent,
	type DragEvent,
	type InputHTMLAttributes,
	useEffect,
	useRef,
	useState,
} from "react";

export type RemoteFile = {
	id: string;
	name: string;
	size: number;
	type: string;
	url: string;
};

export type LocalFile = {
	id: string;
	file: File;
	preview?: string;
};

export type UploadItem =
	| ({ kind: "remote" } & RemoteFile)
	| ({ kind: "local" } & LocalFile);

export type FileValidationError = {
	file: string;
	reason: string;
};

export type FileUploadOptions = {
	initialFiles?: RemoteFile[];
	multiple?: boolean;
	maxFiles?: number;
	maxSize?: number;
	accept?: string;
	allowDuplicates?: boolean;
	autoPreview?: boolean;
	onFilesChange?: (files: UploadItem[]) => void;
	onError?: (errors: FileValidationError[]) => void;
	validateFile?: (file: File) => string | null;
};

const isFileAcceptable = (file: File, acceptList: string[]): boolean => {
	if (acceptList.length === 0) return true;

	return acceptList.some((type) => {
		const trimmed = type.trim();

		if (!trimmed) {
			return false;
		}

		if (trimmed.startsWith(".")) {
			return file.name.toLowerCase().endsWith(trimmed.toLowerCase());
		}

		if (trimmed.endsWith("/*")) {
			const category = trimmed.replace("/*", "");
			return file.type.startsWith(category);
		}

		return file.type === trimmed;
	});
};

const isDuplicateFile = (file: File, existingFiles: UploadItem[]): boolean => {
	return existingFiles.some((item) => {
		if (item.kind === "local") {
			return (
				item.file.name === file.name &&
				item.file.size === file.size &&
				item.file.lastModified === file.lastModified
			);
		}

		return item.name === file.name && item.size === file.size;
	});
};

export function useFileUpload({
	initialFiles = [],
	multiple = false,
	maxFiles = Infinity,
	maxSize = Infinity,
	accept = "",
	allowDuplicates = false,
	autoPreview = true,
	onFilesChange,
	onError,
	validateFile,
}: FileUploadOptions = {}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const filesRef = useRef<UploadItem[]>([]);

	const acceptList = accept ? accept.split(",").map((type) => type.trim()) : [];

	const [files, setFiles] = useState<UploadItem[]>(() =>
		initialFiles.map((file) => ({ kind: "remote" as const, ...file })),
	);
	const [errors, setErrors] = useState<FileValidationError[]>([]);
	const [isDragging, setIsDragging] = useState(false);

	filesRef.current = files;

	useEffect(() => {
		return () => {
			filesRef.current.forEach((item) => {
				if (item.kind === "local" && item.preview) {
					URL.revokeObjectURL(item.preview);
				}
			});
		};
	}, []);

	useEffect(() => {
		if (onFilesChange) {
			onFilesChange(files);
		}
	}, [files, onFilesChange]);

	useEffect(() => {
		if (onError && errors.length > 0) {
			onError(errors);
		}
	}, [errors, onError]);

	function validateSingleFile(file: File, count: number): string | null {
		if (!multiple && count > 0) {
			return "Only one file allowed";
		}

		if (count >= maxFiles) {
			return `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed`;
		}

		if (file.size > maxSize) {
			return "File size exceeds limit"; // (max: ${formatFileSize(maxSize)}, actual: ${formatFileSize(file.size)})
		}

		if (!isFileAcceptable(file, acceptList)) {
			const acceptedTypes =
				acceptList.length > 0 ? acceptList.join(", ") : "all types";
			return `File type not accepted (accepted: ${acceptedTypes})`;
		}

		if (!allowDuplicates && isDuplicateFile(file, filesRef.current)) {
			return "File already uploaded";
		}

		if (validateFile) {
			const customError = validateFile(file);
			if (customError) return customError;
		}

		return null;
	}

	function createLocalFile(file: File): UploadItem {
		const shouldCreatePreview = autoPreview && file.type.startsWith("image/");

		return {
			kind: "local" as const,
			id: crypto.randomUUID(),
			file,
			preview: shouldCreatePreview ? URL.createObjectURL(file) : undefined,
		};
	}

	function addFiles(fileList: FileList | File[]) {
		const filesArray = Array.from(fileList);

		if (filesArray.length === 0) {
			return;
		}

		const validationErrors: FileValidationError[] = [];
		const validFiles: UploadItem[] = [];

		setFiles((prev) => {
			const currentFiles = multiple ? [...prev] : [];

			if (!multiple) {
				prev.forEach((item) => {
					if (item.kind === "local" && item.preview) {
						URL.revokeObjectURL(item.preview);
					}
				});
			}

			for (const file of filesArray) {
				const error = validateSingleFile(
					file,
					currentFiles.length + validFiles.length,
				);

				if (error) {
					validationErrors.push({ file: file.name, reason: error });
				} else {
					validFiles.push(createLocalFile(file));
				}
			}

			setErrors(validationErrors);

			if (inputRef.current) {
				inputRef.current.value = "";
			}

			return [...currentFiles, ...validFiles];
		});
	}

	function removeFile(id: string) {
		setFiles((prev) => {
			const fileToRemove = prev.find((item) => item.id === id);

			if (
				fileToRemove &&
				fileToRemove.kind === "local" &&
				fileToRemove.preview
			) {
				URL.revokeObjectURL(fileToRemove.preview);
			}

			return prev.filter((item) => item.id !== id);
		});
	}

	function replaceFile(id: string, newFile: File) {
		setFiles((prev) => {
			const index = prev.findIndex((item) => item.id === id);

			if (index === -1) return prev;

			const oldItem = prev[index];

			if (oldItem.kind === "local" && oldItem.preview) {
				URL.revokeObjectURL(oldItem.preview);
			}

			const newItem = createLocalFile(newFile);
			const newFiles = [...prev];

			newFiles[index] = newItem;

			return newFiles;
		});
	}

	function clearAll() {
		setFiles((prev) => {
			prev.forEach((item) => {
				if (item.kind === "local" && item.preview) {
					URL.revokeObjectURL(item.preview);
				}
			});

			return [];
		});

		setErrors([]);

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}

	function clearErrors() {
		setErrors([]);
	}

	function onInputChange(event: ChangeEvent<HTMLInputElement>) {
		if (event.target.files) {
			addFiles(event.target.files);
		}
	}

	function getInputProps(props: InputHTMLAttributes<HTMLInputElement> = {}) {
		return {
			...props,
			type: "file" as const,
			accept,
			multiple,
			ref: inputRef,
			onChange: onInputChange,
		};
	}

	function openFileDialog() {
		inputRef.current?.click();
	}

	const dragHandlers = {
		onDragEnter(event: DragEvent) {
			event.preventDefault();
			event.stopPropagation();

			setIsDragging(true);
		},
		onDragLeave(event: DragEvent) {
			event.preventDefault();
			event.stopPropagation();

			if (event.currentTarget === event.target) {
				setIsDragging(false);
			}
		},
		onDragOver(event: DragEvent) {
			event.preventDefault();
			event.stopPropagation();
		},
		onDrop(event: DragEvent) {
			event.preventDefault();
			event.stopPropagation();

			setIsDragging(false);

			if (event.dataTransfer.files) {
				addFiles(event.dataTransfer.files);
			}
		},
	};

	const localFiles = files.filter(
		(file): file is LocalFile & { kind: "local" } => file.kind === "local",
	);

	const remoteFiles = files.filter(
		(file): file is RemoteFile & { kind: "remote" } => file.kind === "remote",
	);

	const hasFiles = files.length > 0;
	const canAddMore = files.length < maxFiles;

	return {
		files,
		localFiles,
		remoteFiles,
		errors,

		isDragging,
		hasFiles,
		canAddMore,

		addFiles,
		removeFile,
		replaceFile,
		clearAll,
		clearErrors,
		openFileDialog,

		getInputProps,
		dragHandlers,
	};
}
