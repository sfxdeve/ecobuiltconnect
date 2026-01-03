"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
  useRef,
  useState,
  useEffect,
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

const createId = () => crypto.randomUUID();

const matchesAccept = (file: File, accept: string) => {
  if (!accept) return true;
  return accept
    .split(",")
    .map((t) => t.trim())
    .some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.replace("/*", ""));
      }
      return file.type === type;
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

  const [files, setFiles] = useState<UploadItem[]>(() =>
    initialFiles.map((f) => ({ kind: "remote", ...f })),
  );

  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  function revoke(item: UploadItem) {
    if (item.kind === "local" && item.preview) {
      URL.revokeObjectURL(item.preview);
    }
  }

  useEffect(() => {
    return () => {
      files.forEach(revoke);
    };
  }, []);

  function validate(file: File, currentCount: number): string | null {
    if (!multiple && currentCount > 0) return "Only one file allowed.";
    if (currentCount >= maxFiles) return `Maximum of ${maxFiles} files allowed.`;
    if (file.size > maxSize) return "File exceeds size limit.";
    if (!matchesAccept(file, accept)) return "File type not allowed.";
    return null;
  }

  function addFiles(input: FileList | File[]) {
    const incoming = Array.from(input);
    if (!incoming.length) return;

    const nextErrors: string[] = [];
    const newItems: UploadItem[] = [];

    setFiles((prev) => {
      const next = multiple ? [...prev] : [];
      
      if (!multiple) {
        prev.forEach(revoke);
      }

      for (const file of incoming) {
        const error = validate(file, next.length + newItems.length);
        if (error) {
          nextErrors.push(error);
        } else {
          newItems.push({
            kind: "local",
            id: createId(),
            file,
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined,
          });
        }
      }

      const finalState = [...next, ...newItems];
      
      queueMicrotask(() => {
        setErrors(nextErrors);
        onChange?.(finalState);
      });

      return finalState;
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const itemToRemove = prev.find((f) => f.id === id);
      if (itemToRemove) revoke(itemToRemove);

      const next = prev.filter((f) => f.id !== id);
      
      queueMicrotask(() => {
        onChange?.(next);
      });
      
      return next;
    });
    
    if (inputRef.current) inputRef.current.value = "";
  }

  function clearAll() {
    setFiles((prev) => {
      prev.forEach(revoke);
      queueMicrotask(() => onChange?.([]));
      return [];
    });
    setErrors([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
  }

  function getInputProps(
    props: InputHTMLAttributes<HTMLInputElement> = {},
  ): InputHTMLAttributes<HTMLInputElement> & { ref: React.RefObject<HTMLInputElement | null> } {
    return {
      ...props,
      type: "file",
      accept,
      multiple,
      ref: inputRef,
      onChange: (e) => {
        props.onChange?.(e);
        onInputChange(e);
      },
    };
  }

  const dragHandlers = {
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    onDragLeave: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    },
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    },
  };

  return {
    files,
    localFiles: files.filter((f) => f.kind === "local"),
    remoteFiles: files.filter((f) => f.kind === "remote"),
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