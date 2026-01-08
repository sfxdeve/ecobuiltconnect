import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { ComponentPropsWithoutRef } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useFileUpload } from "@/hooks/use-file-upload";
import { fetchPlaceNamesByCountry } from "@/lib/cities";
import { composeS3Key, composeS3URL } from "@/lib/s3.shared";
import { cn } from "@/lib/utils";
import { getS3ObjectUploadURL } from "@/remote/shared.s3";
import { ProfileImagePicker } from "../blocks/profile-image-picker";

export const vendorProfileFormSchema = z.object({
	pictureKeys: z
		.array(z.string("Picture key must be a string"))
		.min(1, "One picture is required")
		.max(1, "Only one picture is required"),
	name: z
		.string("Name must be a string")
		.min(3, "Name must be at least 3 characters"),
	description: z
		.string("Description must be a string")
		.min(10, "Description must be at least 10 characters"),
	address: z
		.string("Address must be a string")
		.min(3, "Address must be at least 3 characters"),
	city: z
		.string("City must be a string")
		.min(3, "City must be at least 3 characters"),
	postcode: z
		.string("Postcode must be a string")
		.min(3, "Postcode must be at least 3 characters"),
});

export function VendorProfileForm({
	defaultValues,
	isSubmitting,
	submitHandler,
	className,
	...props
}: ComponentPropsWithoutRef<"form"> & {
	defaultValues: z.infer<typeof vendorProfileFormSchema>;
	isSubmitting: boolean;
	submitHandler: ({
		data,
	}: {
		data: z.infer<typeof vendorProfileFormSchema>;
	}) => void;
}) {
	const [isFileUploading, setIsFileUploading] = useState(false);

	const getS3ObjectUploadURLFn = useServerFn(getS3ObjectUploadURL);

	const cities = useQuery({
		queryKey: ["cities"],
		queryFn: async () => {
			return await fetchPlaceNamesByCountry("ZA", ["city"]);
		},
	});

	const fileUpload = useFileUpload({
		initialFiles: defaultValues.pictureKeys.map((key) => ({
			id: crypto.randomUUID(),
			key,
			url: composeS3URL(key),
		})),
		multiple: false,
		maxFiles: 1,
		maxSize: 5 * 1024 * 1024,
		accept: "image/*",
		keyGenerator: (file) => composeS3Key(file.name, "profiles"),
		onFilesChange: (files) => {
			form.setFieldValue(
				"pictureKeys",
				files.map((file) => file.key),
			);
		},
	});

	const form = useForm({
		validators: {
			onChange: vendorProfileFormSchema,
		},
		defaultValues,
		onSubmit: async ({ value: data }) => {
			if (fileUpload.localFiles.length > 0) {
				try {
					setIsFileUploading(true);

					await Promise.all(
						fileUpload.localFiles.map(async (file) => {
							const { url } = await getS3ObjectUploadURLFn({
								data: {
									key: file.key,
									contentType: file.data.type,
								},
							});

							await fetch(url, {
								method: "PUT",
								headers: {
									"Content-Type": file.data.type,
								},
								body: file.data,
							});
						}),
					);
				} catch {
					toast.error("Failed to upload image.");

					return;
				} finally {
					setIsFileUploading(false);
				}
			}

			submitHandler({ data });
		},
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				form.handleSubmit();
			}}
			className={cn("space-y-6", className)}
			{...props}
		>
			<FieldGroup>
				<div className="flex gap-2 items-start">
					<form.Field name="pictureKeys">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Image</FieldLabel>
									<div>
										<ProfileImagePicker
											id={field.name}
											name={field.name}
											{...fileUpload}
											disabled={isFileUploading || isSubmitting}
											aria-invalid={isInvalid}
										/>
									</div>
									{fileUpload.errors.length > 0 && (
										<FieldError
											errors={fileUpload.errors.map((error) => ({
												message: `${error.file}: ${error.reason}`,
											}))}
										/>
									)}
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>
				<div className="flex gap-2 items-start">
					<form.Field name="name">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Name</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Enter name"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>
				<div className="flex gap-2 items-start">
					<form.Field name="description">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Description</FieldLabel>
									<Textarea
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Enter description"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>
				<div className="flex gap-2 items-start">
					<form.Field name="address">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Address</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Enter address"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>
				<div className="flex gap-2 items-start">
					<form.Field name="postcode">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Postcode</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="Enter postcode"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
					<form.Field name="city">
						{(field) => {
							if (cities.isPending) {
								return <Spinner />;
							}

							if (cities.isError) {
								return null;
							}

							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>City</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value ?? cities.data[0])
										}
									>
										<SelectTrigger
											id={field.name}
											name={field.name}
											onBlur={field.handleBlur}
											aria-invalid={isInvalid}
										>
											<SelectValue>
												{field.state.value ?? "Select city"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent align="start">
											<SelectGroup>
												{cities.data.map((city) => (
													<SelectItem key={city} value={city}>
														{city}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>
				<div className="flex gap-2 items-start justify-stretch">
					<Button
						type="submit"
						disabled={isSubmitting}
						variant="default"
						size="lg"
						className="flex-1"
					>
						{isSubmitting ? <Spinner /> : "Submit"}
					</Button>
				</div>
			</FieldGroup>
		</form>
	);
}
