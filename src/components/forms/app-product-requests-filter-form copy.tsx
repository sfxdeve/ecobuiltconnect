import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

export const appProductRequestsFiltersFormSchema = z.object({
	sortBy: z
		.enum(["name", "createdAt"], "Sort By must be one of name or createdAt")
		.optional(),
	sortOrder: z
		.enum(["asc", "desc"], "Sort Order must be one of asc or desc")
		.optional(),
	minQuantity: z
		.number("Min Quantity must be number")
		.min(1, "Min Quantity must be greater than 0")
		.optional(),
	minPrice: z
		.number("Min Price must be number")
		.min(1, "Min Price must be greater than 0")
		.optional(),
	maxPrice: z
		.number("Max Price must be number")
		.min(1, "Max Price must be greater than 0")
		.optional(),
});

export function AppProductRequestsFiltersForm({
	defaultValues,
	submitHandler,
	resetHandler,
}: {
	defaultValues: z.infer<typeof appProductRequestsFiltersFormSchema>;
	submitHandler: (
		data: z.infer<typeof appProductRequestsFiltersFormSchema>,
	) => void;
	resetHandler: (
		data: z.infer<typeof appProductRequestsFiltersFormSchema>,
	) => void;
}) {
	const form = useForm({
		validators: {
			onChange: appProductRequestsFiltersFormSchema,
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
					<form.Field name="minQuantity">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Min Quantity</FieldLabel>
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
				<div className="flex gap-2 items-start justify-stretch">
					<Button
						onClick={() => {
							form.reset({
								sortBy: undefined,
								sortOrder: undefined,
								minQuantity: undefined,
								minPrice: undefined,
								maxPrice: undefined,
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
