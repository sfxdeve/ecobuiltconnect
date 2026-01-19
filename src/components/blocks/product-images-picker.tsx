import { PlusIcon, XIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FileUploadReturn } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";

export function ProductImagesPicker({
	files,
	localFiles,
	remoteFiles,
	errors,
	isDragging,

	addFiles,
	replaceFile,
	removeFile,
	clearAll,
	clearErrors,
	openFileDialog,

	getInputProps,
	dragHandlers,

	disabled,

	className,
	...props
}: ComponentPropsWithoutRef<typeof Input> &
	FileUploadReturn & { disabled: boolean }) {
	return (
		<>
			<Input
				{...getInputProps()}
				className={cn("hidden", className)}
				{...props}
			/>
			{files.length < 1 && !disabled && (
				// biome-ignore lint/a11y/noStaticElementInteractions: Intentional
				// biome-ignore lint/a11y/useKeyWithClickEvents: Intentional
				<div
					{...dragHandlers}
					onClick={openFileDialog}
					className={cn(
						"border border-dashed rounded-3xl p-4 text-center cursor-pointer",
						{
							"border-primary bg-primary/10": isDragging,
						},
					)}
				>
					{isDragging
						? "Release to upload your images"
						: "Click or drag images to upload"}
				</div>
			)}
			{files.length > 0 && (
				<div className="grid grid-cols-3 gap-2 place-items-center">
					{remoteFiles.map((file) => (
						<div
							key={file.id}
							className="relative size-24 border border-input rounded p-1"
						>
							<img
								src={file.url}
								alt={file.id}
								className="size-full object-cover"
							/>
							<Button
								onClick={() => {
									removeFile(file.id);
								}}
								disabled={disabled}
								variant="destructive"
								size="icon-xs"
								className="absolute -top-2 -right-2"
							>
								<XIcon />
							</Button>
						</div>
					))}
					{localFiles.map((file) => (
						<div
							key={file.id}
							className="relative size-24 border border-input rounded p-1"
						>
							{file.preview && (
								<img
									src={file.preview}
									alt={file.data.name}
									className="size-full object-cover"
								/>
							)}
							<Button
								onClick={() => {
									removeFile(file.id);
								}}
								disabled={disabled}
								variant="destructive"
								size="icon-xs"
								className="absolute -top-2 -right-2"
							>
								<XIcon />
							</Button>
						</div>
					))}
					{!disabled && (
						// biome-ignore lint/a11y/noStaticElementInteractions: Intentional
						// biome-ignore lint/a11y/useKeyWithClickEvents: Intentional
						<div
							{...dragHandlers}
							onClick={openFileDialog}
							className={cn(
								"size-24 border border-input rounded p-1 flex flex-col justify-center items-center cursor-pointer",
								{
									"border-primary bg-primary/10": isDragging,
								},
							)}
						>
							<PlusIcon
								className={cn("text-muted-foreground", {
									"text-primary": isDragging,
								})}
							/>
						</div>
					)}
				</div>
			)}
		</>
	);
}
