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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const adminProfileFormSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(3, "Name must be at least 3 characters"),
	description: z
		.string("Description must be a string")
		.min(10, "Description must be at least 10 characters"),
});

export function AdminProfileForm({
	defaultValues,
	isSubmitting,
	submitHandler,
	className,
	...props
}: ComponentPropsWithoutRef<"form"> & {
	defaultValues: z.infer<typeof adminProfileFormSchema>;
	isSubmitting: boolean;
	submitHandler: ({
		data,
	}: {
		data: z.infer<typeof adminProfileFormSchema>;
	}) => void;
}) {
	const form = useForm({
		validators: {
			onChange: adminProfileFormSchema,
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
