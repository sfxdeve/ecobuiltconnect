import { useForm } from "@tanstack/react-form";
import type { ComponentPropsWithoutRef } from "react";
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
import { cn } from "@/lib/utils";
import { ProfileStatus } from "@/prisma/generated/enums";

export const adminVendorProfileFormSchema = z.object({
	status: z
		.enum(
			[ProfileStatus.PENDING, ProfileStatus.REJECTED, ProfileStatus.APPROVED],
			`Status must be either '${ProfileStatus.PENDING}', '${ProfileStatus.REJECTED}', or '${ProfileStatus.APPROVED}'`,
		)
		.optional(),
});

export function AdminVendorProfileForm({
	defaultValues,
	isSubmitting,
	submitHandler,
	className,
	...props
}: ComponentPropsWithoutRef<"form"> & {
	defaultValues: z.infer<typeof adminVendorProfileFormSchema>;
	isSubmitting: boolean;
	submitHandler: ({
		data,
	}: {
		data: z.infer<typeof adminVendorProfileFormSchema>;
	}) => void;
}) {
	const form = useForm({
		validators: {
			onChange: adminVendorProfileFormSchema,
		},
		defaultValues,
		onSubmit: async ({ value: data }) => {
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
											field.handleChange(value ?? ProfileStatus.APPROVED)
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
												{Object.values(ProfileStatus).map((status) => (
													<SelectItem key={status} value={status}>
														{status}
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
