import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export const productsFiltersSchema = z.object({
	minPrice: z
		.number("Min Price must be number")
		.min(1, "Min Price must be greater than 0")
		.optional(),
	maxPrice: z
		.number("Max Price must be number")
		.min(1, "Max Price must be greater than 0")
		.optional(),
});

export function ProductsFiltersForm({
	defaultValues,
	submitHandler,
	resetHandler,
}: {
	defaultValues: z.infer<typeof productsFiltersSchema>;
	submitHandler: (data: z.infer<typeof productsFiltersSchema>) => void;
	resetHandler: (data: z.infer<typeof productsFiltersSchema>) => void;
}) {
	const form = useForm({
		validators: {
			onChange: productsFiltersSchema,
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
				<form.Subscribe selector={({ isSubmitting }) => [isSubmitting]}>
					{([isSubmitting]) => (
						<Field orientation="horizontal" className="justify-end">
							<Button
								onClick={() => {
									form.reset({
										minPrice: undefined,
										maxPrice: undefined,
									});

									resetHandler(form.state.values);
								}}
								disabled={isSubmitting}
								variant="outline"
								size="lg"
							>
								Reset
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
								variant="default"
								size="lg"
							>
								Apply
							</Button>
						</Field>
					)}
				</form.Subscribe>
			</FieldGroup>
		</form>
	);
}
