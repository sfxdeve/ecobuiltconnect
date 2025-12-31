import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
import { getCategories } from "@/lib/api/public.category";

export const userProductRequestFormSchema = z.object({
	pictureIds: z
		.array(z.string("Picture id must be a string"))
		.min(1, "At least one picture id is required"),
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
	const getCategoriesFn = useServerFn(getCategories);

	const categoriesResult = useQuery({
		queryKey: ["categories"],
		queryFn: () => getCategoriesFn({ data: {} }),
	});

	const form = useForm({
		validators: {
			onChange: userProductRequestFormSchema,
		},
		defaultValues,
		onSubmit: ({ value: data }) => {
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
