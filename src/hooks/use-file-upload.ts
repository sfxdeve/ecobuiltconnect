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
};

type FileValidationResult = {
	errors: FileValidationError[];
	validFiles: File[];
};

const isFileAcceptable = (file: File, acceptList: string[]): boolean => {
	if (acceptList.length === 0) return true;

	return acceptList.some((type) => {
		const trimmed = type.trim();
		if (!trimmed) return false;

		if (trimmed.startsWith(".")) {
			return file.name.toLowerCase().endsWith(trimmed.toLowerCase());
		}

		if (trimmed.endsWith("/*")) {
			const category = trimmed.slice(0, -2);
			return file.type.startsWith(category);
		}

		return file.type === trimmed;
	});
};

const createFilePreview = (file: File): string | undefined => {
	if (file.type.startsWith("image/")) {
		return URL.createObjectURL(file);
	}
};

const revokeFilePreview = (item: UploadItem): void => {
	if (item.kind === "local" && item.preview) {
		URL.revokeObjectURL(item.preview);
	}
};

const validateFiles = (
	newFiles: File[],
	existingFiles: UploadItem[],
	multiple: boolean,
	maxFiles: number,
	maxSize: number,
	acceptList: string[],
): FileValidationResult => {
	const validationErrors: FileValidationError[] = [];
	const validFiles: File[] = [];

	const currentCount = existingFiles.length;
	const remainingSlots = maxFiles - currentCount;
	const filesToProcess = multiple ? newFiles : [newFiles[0]];

	for (const [index, file] of filesToProcess.entries()) {
		if (validFiles.length >= remainingSlots) {
			validationErrors.push({
				file: file.name,
				reason: `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed. Cannot add more files.`,
			});
			continue;
		}

		if (file.size > maxSize) {
			validationErrors.push({
				file: file.name,
				reason: "File size exceeds maximum allowed size",
			});
			continue;
		}

		if (acceptList.length > 0 && !isFileAcceptable(file, acceptList)) {
			validationErrors.push({
				file: file.name,
				reason: `File type not accepted. Allowed: ${acceptList.join(", ")}`,
			});
			continue;
		}

		if (!multiple && existingFiles.length > 0 && index === 0) {
			validationErrors.push({
				file: file.name,
				reason: "Only one file allowed",
			});
			continue;
		}

		validFiles.push(file);
	}

	return { errors: validationErrors, validFiles };
};

export function useFileUpload({
	initialFiles = [],
	multiple = false,
	maxFiles = Infinity,
	maxSize = Infinity,
	accept = "",
}: FileUploadOptions = {}) {
	const [files, setFiles] = useState<UploadItem[]>(() =>
		initialFiles.map((file) => ({ kind: "remote" as const, ...file })),
	);
	const [errors, setErrors] = useState<FileValidationError[]>([]);
	const [isDragging, setIsDragging] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);
	const filesRef = useRef<UploadItem[]>(files);

	useEffect(() => {
		filesRef.current = files;
	}, [files]);

	useEffect(() => {
		return () => {
			filesRef.current.forEach(revokeFilePreview);
		};
	}, []);

	const acceptList = accept
		? accept
				.split(",")
				.map((type) => type.trim())
				.filter(Boolean)
		: [];

	const addFiles = (fileList: FileList | File[]) => {
		const filesArray = Array.from(fileList);

		if (filesArray.length === 0) {
			return;
		}

		setFiles((currentFiles) => {
			const { errors: validationErrors, validFiles } = validateFiles(
				filesArray,
				currentFiles,
				multiple,
				maxFiles,
				maxSize,
				acceptList,
			);

			if (validationErrors.length > 0) {
				setErrors(validationErrors);
			} else {
				setErrors([]);
			}

			if (validFiles.length === 0) {
				return currentFiles;
			}

			const filesToProcess = multiple ? currentFiles : [];

			if (!multiple) {
				currentFiles.forEach(revokeFilePreview);
			}

			const newUploadItems: UploadItem[] = validFiles.map((file) => ({
				kind: "local" as const,
				id: crypto.randomUUID(),
				file,
				preview: createFilePreview(file),
			}));

			const updatedFiles = [...filesToProcess, ...newUploadItems];

			return updatedFiles;
		});

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	const removeFile = (id: string) => {
		setFiles((currentFiles) => {
			const fileToRemove = currentFiles.find((item) => item.id === id);

			if (fileToRemove) {
				revokeFilePreview(fileToRemove);
			}

			return currentFiles.filter((item) => item.id !== id);
		});
	};

	const replaceFile = (id: string, newFile: File) => {
		setFiles((currentFiles) => {
			const index = currentFiles.findIndex((item) => item.id === id);

			if (index === -1) {
				return currentFiles;
			}

			const oldItem = currentFiles[index];

			revokeFilePreview(oldItem);

			const newItem: UploadItem = {
				kind: "local" as const,
				id: crypto.randomUUID(),
				file: newFile,
				preview: createFilePreview(newFile),
			};

			const newFiles = [...currentFiles];

			newFiles[index] = newItem;

			return newFiles;
		});
	};

	const clearAll = () => {
		setFiles((currentFiles) => {
			currentFiles.forEach(revokeFilePreview);

			return [];
		});

		setErrors([]);

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	const clearErrors = () => {
		setErrors([]);
	};

	const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			addFiles(event.target.files);
		}
	};

	const openFileDialog = () => {
		inputRef.current?.click();
	};

	const getInputProps = (
		props: InputHTMLAttributes<HTMLInputElement> = {},
	) => ({
		...props,
		type: "file" as const,
		accept,
		multiple,
		ref: inputRef,
		onChange: onInputChange,
	});

	const dragHandlers = {
		onDragEnter: (event: DragEvent) => {
			event.preventDefault();
			event.stopPropagation();

			setIsDragging(true);
		},
		onDragLeave: (event: DragEvent) => {
			event.preventDefault();
			event.stopPropagation();

			setIsDragging(false);
		},
		onDragOver: (event: DragEvent) => {
			event.preventDefault();
			event.stopPropagation();
		},
		onDrop: (event: DragEvent) => {
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

	return {
		files,
		errors,
		localFiles,
		remoteFiles,
		isDragging,

		addFiles,
		replaceFile,
		removeFile,
		clearAll,
		clearErrors,
		openFileDialog,

		getInputProps,
		dragHandlers,
	};
}
