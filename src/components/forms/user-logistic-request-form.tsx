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
import { Spinner } from "@/components/ui/spinner";

export const userLogisticRequestFormSchema = z.object({
	requestedPrice: z
		.number("Requested price must be a number")
		.min(1, "Requested price must be at least 1"),
	orderRequestId: z.uuid("Order request id must be valid UUID"),
});

export function UserLogisticRequestForm({
	defaultValues,
	isSubmitting,
	submitHandler,
}: {
	defaultValues: z.infer<typeof userLogisticRequestFormSchema>;
	isSubmitting: boolean;
	submitHandler: (data: z.infer<typeof userLogisticRequestFormSchema>) => void;
}) {
	const form = useForm({
		validators: {
			onChange: userLogisticRequestFormSchema,
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
					<form.Field name="requestedPrice">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Price</FieldLabel>
									<Input
										id={field.name}
										type="number"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.valueAsNumber)}
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
						{isSubmitting ? <Spinner /> : "Request Logistic"}
					</Button>
				</div>
			</FieldGroup>
		</form>
	);
}
