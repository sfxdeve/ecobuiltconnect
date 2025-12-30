import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { OrderStatus } from "@/prisma/generated/enums";

export const vendorOrderRequestFormSchema = z.object({
	status: z
		.enum(
			[OrderStatus.PROCESSING, OrderStatus.READY, OrderStatus.COMPLETED],
			`Status must be either '${OrderStatus.PROCESSING}', '${OrderStatus.READY}', or '${OrderStatus.COMPLETED}'`,
		)
		.optional(),
});

export function VendorOrderRequestForm({
	defaultValues,
	isSubmitting,
	submitHandler,
}: {
	defaultValues: z.infer<typeof vendorOrderRequestFormSchema>;
	isSubmitting: boolean;
	submitHandler: ({
		data,
	}: {
		data: z.infer<typeof vendorOrderRequestFormSchema>;
	}) => void;
}) {
	const form = useForm({
		validators: {
			onChange: vendorOrderRequestFormSchema,
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
					<form.Field name="status">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Status</FieldLabel>
									<Select
										value={field.state.value}
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
											<SelectValue>
												{field.state.value ?? "Select status"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent align="start">
											<SelectGroup>
												<SelectItem value={OrderStatus.PROCESSING}>
													{OrderStatus.PROCESSING}
												</SelectItem>
												<SelectItem value={OrderStatus.READY}>
													{OrderStatus.READY}
												</SelectItem>
												<SelectItem value={OrderStatus.COMPLETED}>
													{OrderStatus.COMPLETED}
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
