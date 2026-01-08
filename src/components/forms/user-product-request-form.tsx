import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
import { composeS3Key, composeS3URL } from "@/lib/s3.shared";
import { getCategories } from "@/remote/public.category";
import { getS3ObjectUploadURL } from "@/remote/shared.s3";
import { ProductImagesPicker } from "../blocks/product-images-picker";

export const userProductRequestFormSchema = z.object({
	pictureKeys: z
		.array(z.string("Picture key must be a string"))
		.min(1, "At least one picture is required"),
	name: z
		.string("Name must be a string")
		.min(3, "Name must be at least 3 characters"),
	description: z
		.string("Description must be a string")
		.min(10, "Description must be at least 10 characters"),
	quantity: z
		.int("Quantity must be an integer")
		.positive("Quantity must be a positive integer"),
	price: z
		.number("Price must be a number")
		.positive("Price must be a positive number"),
	category: z.object({
		connect: z.object({
			id: z.uuid("Category id must be valid UUID"),
		}),
	}),
});

export function UserProductRequestForm({
	defaultValues,
	isSubmitting,
	submitHandler,
}: {
	defaultValues: z.infer<typeof userProductRequestFormSchema>;
	isSubmitting: boolean;
	submitHandler: ({
		data,
	}: {
		data: z.infer<typeof userProductRequestFormSchema>;
	}) => void;
}) {
	const [areFilesUploading, setAreFilesUploading] = useState(false);

	const getS3ObjectUploadURLFn = useServerFn(getS3ObjectUploadURL);
	const getCategoriesFn = useServerFn(getCategories);

	const categoriesResult = useQuery({
		queryKey: ["categories"],
		queryFn: () => getCategoriesFn({ data: {} }),
	});

	const fileUpload = useFileUpload({
		initialFiles: defaultValues.pictureKeys.map((key) => ({
			id: crypto.randomUUID(),
			key,
			url: composeS3URL(key),
		})),
		multiple: true,
		maxFiles: 5,
		maxSize: 5 * 1024 * 1024,
		accept: "image/*",
		keyGenerator: (file) => composeS3Key(file.name, "products"),
		onFilesChange: (files) => {
			form.setFieldValue(
				"pictureKeys",
				files.map((file) => file.key),
			);
		},
	});

	const form = useForm({
		validators: {
			onChange: userProductRequestFormSchema,
		},
		defaultValues,
		onSubmit: async ({ value: data }) => {
			if (fileUpload.localFiles.length > 0) {
				try {
					setAreFilesUploading(true);

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
					toast.error("Failed to upload images.");

					return;
				} finally {
					setAreFilesUploading(false);
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
		>
			<FieldGroup>
				<div className="flex gap-2 items-start">
					<form.Field name="pictureKeys">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Images</FieldLabel>
									<ProductImagesPicker
										id={field.name}
										name={field.name}
										{...fileUpload}
										disabled={areFilesUploading || isSubmitting}
										aria-invalid={isInvalid}
									/>
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
					<form.Field name="category.connect.id">
						{(field) => {
							if (categoriesResult.isPending) {
								return <Spinner />;
							}

							if (categoriesResult.isError) {
								return null;
							}

							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Category</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(
												value ?? categoriesResult.data.categories[0].id,
											)
										}
									>
										<SelectTrigger
											id={field.name}
											name={field.name}
											onBlur={field.handleBlur}
											aria-invalid={isInvalid}
										>
											<SelectValue>
												{categoriesResult.data.categories.find(
													(category) => category.id === field.state.value,
												)?.name || "Select category"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent align="start">
											<SelectGroup>
												{categoriesResult.data.categories.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.name}
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
				<div className="flex gap-2 items-start">
					<form.Field name="quantity">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type="number"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(
												Number.isFinite(e.target.valueAsNumber)
													? e.target.valueAsNumber
													: 0,
											)
										}
										aria-invalid={isInvalid}
										placeholder="Enter quantity"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
					<form.Field name="price">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Price</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type="number"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(
												Number.isFinite(e.target.valueAsNumber)
													? e.target.valueAsNumber
													: 0,
											)
										}
										aria-invalid={isInvalid}
										placeholder="Enter price"
									/>
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
						{isSubmitting ? <Spinner /> : "Request Product"}
					</Button>
				</div>
			</FieldGroup>
		</form>
	);
}
