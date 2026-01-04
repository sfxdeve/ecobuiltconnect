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
		const trimmed = type.trim().toLowerCase();

		if (!trimmed) {
			return false;
		}

		if (trimmed.startsWith(".")) {
			return file.name.toLowerCase().endsWith(trimmed);
		}

		if (trimmed.endsWith("/*")) {
			return file.type.startsWith(trimmed.slice(0, -2));
		}

		return file.type === trimmed;
	});
};

const createLocalUploadItem = (file: File): UploadItem => ({
	kind: "local",
	id: crypto.randomUUID(),
	file,
	preview: createFilePreview(file),
});

const createFilePreview = (file: File): string | undefined => {
	if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
		return URL.createObjectURL(file);
	}

	return undefined;
};

const revokeFilePreview = (item: UploadItem): void => {
	if (item.kind === "local" && item.preview) {
		try {
			URL.revokeObjectURL(item.preview);
		} catch {}
	}
};

const validateFiles = (
	newFiles: File[],
	existingFilesCount: number,
	multiple: boolean,
	maxFiles: number,
	maxSize: number,
	acceptList: string[],
): FileValidationResult => {
	if (newFiles.length === 0) {
		return { errors: [], validFiles: [] };
	}

	const errors: FileValidationError[] = [];
	const validFiles: File[] = [];

	const remainingSlots = Math.max(0, maxFiles - existingFilesCount);
	const filesToProcess = multiple ? newFiles : newFiles.slice(0, 1);

	for (const file of filesToProcess) {
		if (validFiles.length >= remainingSlots) {
			errors.push({
				file: file.name,
				reason: `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed`,
			});
			continue;
		}

		if (file.size > maxSize) {
			errors.push({
				file: file.name,
				reason: `File exceeds max size of ${Math.round(
					maxSize / 1024 / 1024,
				)}MB`,
			});
			continue;
		}

		if (acceptList.length && !isFileAcceptable(file, acceptList)) {
			errors.push({
				file: file.name,
				reason: `File type not accepted (${acceptList.join(", ")})`,
			});
			continue;
		}

		validFiles.push(file);
	}

	return { errors, validFiles };
};

export function useFileUpload({
	initialFiles = [],
	multiple = false,
	maxFiles = Infinity,
	maxSize = Infinity,
	accept = "",
}: FileUploadOptions = {}) {
	const [files, setFiles] = useState<UploadItem[]>(() =>
		initialFiles.map((f) => ({ kind: "remote", ...f })),
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
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);

	const addFiles = (fileList: FileList | File[]) => {
		const incoming = Array.from(fileList);
		if (!incoming.length) {
			return;
		}

		const currentFiles = filesRef.current;

		const { errors, validFiles } = validateFiles(
			incoming,
			currentFiles.length,
			multiple,
			maxFiles,
			maxSize,
			acceptList,
		);

		setErrors(errors);

		if (!validFiles.length) {
			return;
		}

		setFiles(() => {
			if (!multiple) {
				currentFiles.forEach(revokeFilePreview);

				return validFiles.map(createLocalUploadItem);
			}

			return [...currentFiles, ...validFiles.map(createLocalUploadItem)];
		});

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	const removeFile = (id: string) => {
		setFiles((current) => {
			const item = current.find((f) => f.id === id);

			if (item) {
				revokeFilePreview(item);
			}

			return current.filter((f) => f.id !== id);
		});
	};

	const replaceFile = (id: string, newFile: File) => {
		const { validFiles } = validateFiles(
			[newFile],
			filesRef.current.length - 1,
			false,
			1,
			maxSize,
			acceptList,
		);

		if (!validFiles.length) return;

		setFiles((current) => {
			const index = current.findIndex((f) => f.id === id);

			if (index === -1) {
				return current;
			}

			revokeFilePreview(current[index]);

			const updated = [...current];

			updated[index] = createLocalUploadItem(newFile);

			return updated;
		});
	};

	const clearAll = () => {
		setFiles((current) => {
			current.forEach(revokeFilePreview);

			return [];
		});

		setErrors([]);

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	const clearErrors = () => setErrors([]);

	const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			addFiles(event.target.files);
		}
	};

	const openFileDialog = () => inputRef.current?.click();

	const getInputProps = (
		props: InputHTMLAttributes<HTMLInputElement> = {},
	) => ({
		...props,
		type: "file" as const,
		accept,
		multiple,
		ref: inputRef,
		onChange: (e: ChangeEvent<HTMLInputElement>) => {
			props.onChange?.(e);
			onInputChange(e);
		},
	});

	const dragHandlers = {
		onDragEnter: (event: DragEvent) => {
			event.preventDefault();
			event.stopPropagation();

			setIsDragging(true);
		},
		onDragOver: (event: DragEvent) => {
			event.preventDefault();
			event.stopPropagation();
		},
		onDragLeave: (event: DragEvent) => {
			if (event.currentTarget.contains(event.relatedTarget as Node)) {
				return;
			}

			setIsDragging(false);
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

	/* =======================
	   Derived
	======================= */

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
