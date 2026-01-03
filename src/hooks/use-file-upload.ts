"use client";

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

export type FileUploadOptions = {
	initialFiles?: RemoteFile[];
	multiple?: boolean;
	maxFiles?: number;
	maxSize?: number;
	accept?: string;
	onChange?: (files: UploadItem[]) => void;
};

const generateUUID = () => crypto.randomUUID();

const revokeItemURL = (item: UploadItem) => {
	if (item.kind === "local" && item.preview) URL.revokeObjectURL(item.preview);
};

const isFileAcceptable = (file: File, acceptList: string[]) => {
	if (acceptList.length === 0) return true;

	return acceptList.some((type) => {
		const trimedType = type.trim();

		if (trimedType.startsWith(".")) {
			return file.name.toLowerCase().endsWith(trimedType.toLowerCase());
		}

		if (trimedType.endsWith("/*")) {
			return file.type.startsWith(trimedType.replace("/*", ""));
		}

		return file.type === trimedType;
	});
};

export function useFileUpload({
	initialFiles = [],
	multiple = false,
	maxFiles = Infinity,
	maxSize = Infinity,
	accept = "",
	onChange,
}: FileUploadOptions = {}) {
	const inputRef = useRef<HTMLInputElement>(null);

	const acceptList = accept.split(",").map((type) => type.trim());

	const [files, setFiles] = useState<UploadItem[]>(
		initialFiles.map((f) => ({ kind: "remote", ...f })),
	);
	const [errors, setErrors] = useState<string[]>([]);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		return () => files.forEach(revokeItemURL);
	}, [files]);

	const validate = (file: File, count: number) => {
		if (!multiple && count > 0) {
			return "Only one file allowed.";
		}

		if (count >= maxFiles) {
			return `Maximum of ${maxFiles} files allowed.`;
		}

		if (file.size > maxSize) {
			return "File exceeds size limit.";
		}

		if (!isFileAcceptable(file, acceptList)) {
			return "File type not allowed.";
		}

		return null;
	};

	const addFiles = (input: FileList | File[]) => {
		const files = Array.from(input);

		if (!files.length) {
			return;
		}

		const newItems: UploadItem[] = [];
		const newErrors: string[] = [];

		setFiles((prev) => {
			const currentFiles = multiple ? [...prev] : [];

			if (!multiple) {
				prev.forEach(revokeItemURL);
			}

			for (const file of files) {
				const error = validate(file, currentFiles.length + newItems.length);

				if (error) {
					newErrors.push(error);
				} else {
					newItems.push({
						kind: "local",
						id: generateUUID(),
						file,
						preview: file.type.startsWith("image/")
							? URL.createObjectURL(file)
							: undefined,
					});
				}
			}

			const newState = [...currentFiles, ...newItems];

			setErrors(newErrors);
			onChange?.(newState);

			if (inputRef.current) inputRef.current.value = "";

			return newState;
		});
	};

	const removeFile = (id: string) => {
		setFiles((prev) => {
			const fileToRemove = prev.find((file) => file.id === id);

			if (fileToRemove) {
				revokeItemURL(fileToRemove);
			}

			const newFiles = prev.filter((file) => file.id !== id);

			onChange?.(newFiles);

			if (inputRef.current) {
				inputRef.current.value = "";
			}

			return newFiles;
		});
	};

	const clearAll = () => {
		setFiles((prev) => {
			prev.forEach(revokeItemURL);

			onChange?.([]);

			return [];
		});

		setErrors([]);

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			addFiles(event.target.files);
		}
	};

	const getInputProps = (
		props: InputHTMLAttributes<HTMLInputElement> = {},
	) => ({
		...props,
		type: "file",
		accept,
		multiple,
		ref: inputRef,
		onChange: (event: ChangeEvent<HTMLInputElement>) => {
			props.onChange?.(event);
			onInputChange(event);
		},
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

	return {
		files,
		localFiles: files.filter((file) => file.kind === "local"),
		remoteFiles: files.filter((file) => file.kind === "remote"),
		errors,
		isDragging,

		addFiles,
		removeFile,
		clearAll,
		openFileDialog: () => inputRef.current?.click(),

		getInputProps,
		dragHandlers,
	};
}
