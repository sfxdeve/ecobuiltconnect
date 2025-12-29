import { useForm } from "@tanstack/react-form";
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

export const userProductRequestsFiltersFormSchema = z.object({
	sortBy: z
		.enum(["name", "createdAt"], {
			message: "Sort by must be either 'name' or 'createdAt'",
		})
		.optional(),
	sortOrder: z
		.enum(["asc", "desc"], {
			message: "Sort order must be either 'asc' or 'desc'",
		})
		.optional(),
	minQuantity: z
		.int("Minimum quantity must be an integer")
		.min(1, "Minimum quantity must be at least 1")
		.optional(),
	minPrice: z
		.number("Minimum price must be a number")
		.min(1, "Minimum price must be at least 1")
		.optional(),
	maxPrice: z
		.number("Maximum price must be a number")
		.min(1, "Maximum price must be at least 1")
		.optional(),
});

export function UserProductRequestsFiltersForm({
	defaultValues,
	submitHandler,
	resetHandler,
}: {
	defaultValues: z.infer<typeof userProductRequestsFiltersFormSchema>;
	submitHandler: (
		data: z.infer<typeof userProductRequestsFiltersFormSchema>,
	) => void;
	resetHandler: (
		data: z.infer<typeof userProductRequestsFiltersFormSchema>,
	) => void;
}) {
	const form = useForm({
		validators: {
			onChange: userProductRequestsFiltersFormSchema,
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
									<FieldLabel htmlFor={field.name}>Sort by</FieldLabel>
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
									<FieldLabel htmlFor={field.name}>Sort order</FieldLabel>
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
									<FieldLabel htmlFor={field.name}>Minimum quantity</FieldLabel>
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
									<FieldLabel htmlFor={field.name}>Minimum price</FieldLabel>
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
									<FieldLabel htmlFor={field.name}>Maximum price</FieldLabel>
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
