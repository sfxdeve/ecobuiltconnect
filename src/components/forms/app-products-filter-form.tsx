import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
	Field,
	FieldContent,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
	FieldTitle,
} from "../ui/field";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

export const appProductsFiltersFormSchema = z.object({
	sortBy: z
		.enum(["name", "createdAt"], "Sort By must be one of name or createdAt")
		.optional(),
	sortOrder: z
		.enum(["asc", "desc"], "Sort Order must be one of asc or desc")
		.optional(),
	minStock: z
		.int("Min Stock must be integer")
		.min(1, "Min Stock must be greater than 0")
		.optional(),
	minPrice: z
		.number("Min Price must be number")
		.min(1, "Min Price must be greater than 0")
		.optional(),
	maxPrice: z
		.number("Max Price must be number")
		.min(1, "Max Price must be greater than 0")
		.optional(),
	isVerified: z.boolean("Is Verified must be boolean").optional(),
});

export function AppProductsFiltersForm({
	defaultValues,
	submitHandler,
	resetHandler,
}: {
	defaultValues: z.infer<typeof appProductsFiltersFormSchema>;
	submitHandler: (data: z.infer<typeof appProductsFiltersFormSchema>) => void;
	resetHandler: (data: z.infer<typeof appProductsFiltersFormSchema>) => void;
}) {
	const form = useForm({
		validators: {
			onChange: appProductsFiltersFormSchema,
		},
		defaultValues,
		onSubmit: ({ value: data }) => {
			submitHandler(data);
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
					<form.Field name="sortBy">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Sort By</FieldLabel>
									<Select
										value={field.state.value ?? null}
										onValueChange={(value) =>
											field.handleChange(value ?? undefined)
										}
									>
										<SelectTrigger
											id={field.name}
											name={field.name}
											onBlur={field.handleBlur}
											aria-invalid={isInvalid}
										>
											<SelectValue className="capitalize">
												{field.state.value || "Select sort by"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent align="start">
											<SelectGroup>
												<SelectItem value="name" className="capitalize">
													name
												</SelectItem>
												<SelectItem value="createdAt" className="capitalize">
													createdAt
												</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
					<form.Field name="sortOrder">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Sort Order</FieldLabel>
									<Select
										value={field.state.value ?? null}
										onValueChange={(value) =>
											field.handleChange(value ?? undefined)
										}
									>
										<SelectTrigger
											id={field.name}
											name={field.name}
											onBlur={field.handleBlur}
											aria-invalid={isInvalid}
										>
											<SelectValue className="capitalize">
												{field.state.value || "Select sort order"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent align="start">
											<SelectGroup>
												<SelectItem value="asc" className="capitalize">
													Asc
												</SelectItem>
												<SelectItem value="desc" className="capitalize">
													Desc
												</SelectItem>
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
					<form.Field name="minStock">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Min Stock</FieldLabel>
									<Input
										id={field.name}
										type="number"
										name={field.name}
										value={field.state.value ?? 0}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.valueAsNumber)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>
				<div className="flex gap-2 items-start">
					<form.Field name="minPrice">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Min Price</FieldLabel>
									<Input
										id={field.name}
										type="number"
										name={field.name}
										value={field.state.value ?? 0}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.valueAsNumber)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
					<form.Field name="maxPrice">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Max Price</FieldLabel>
									<Input
										id={field.name}
										type="number"
										name={field.name}
										value={field.state.value ?? 0}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.valueAsNumber)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>
				<div className="flex gap-2 items-start">
					<form.Field name="isVerified">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<FieldSet className="flex-1">
									<FieldLabel htmlFor={field.name}>
										<Field data-invalid={isInvalid} orientation="horizontal">
											<Checkbox
												id={field.name}
												name={field.name}
												checked={field.state.value ?? false}
												onBlur={field.handleBlur}
												onCheckedChange={(value) =>
													field.handleChange(value ? true : undefined)
												}
												aria-invalid={isInvalid}
											/>
											<FieldContent>
												<FieldTitle>Ecobuilt Connect Verified</FieldTitle>
											</FieldContent>
										</Field>
									</FieldLabel>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</FieldSet>
							);
						}}
					</form.Field>
				</div>
				<div className="flex gap-2 items-start justify-stretch">
					<Button
						onClick={() => {
							form.reset({
								sortBy: undefined,
								sortOrder: undefined,
								minStock: undefined,
								minPrice: undefined,
								maxPrice: undefined,
								isVerified: undefined,
							});

							resetHandler(form.state.values);
						}}
						variant="outline"
						size="lg"
						className="flex-1"
					>
						Reset
					</Button>
					<Button type="submit" variant="default" size="lg" className="flex-1">
						Apply
					</Button>
				</div>
			</FieldGroup>
		</form>
	);
}
