import { useForm } from "@tanstack/react-form";
import type { ComponentPropsWithoutRef } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
	FieldTitle,
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
import { cn } from "@/lib/utils";

export const userProductsFiltersFormSchema = z.object({
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
	minStock: z
		.union([z.undefined(), z.nan().transform(() => undefined), z.number()])
		.pipe(
			z
				.int("Minimum stock must be an integer")
				.positive("Minimum stock must be a positive integer")
				.optional(),
		),
	minPrice: z
		.union([z.undefined(), z.nan().transform(() => undefined), z.number()])
		.pipe(
			z
				.number("Minimum price must be a number")
				.positive("Minimum price must be a positive number")
				.optional(),
		),
	maxPrice: z
		.union([z.undefined(), z.nan().transform(() => undefined), z.number()])
		.pipe(
			z
				.number("Maximum price must be a number")
				.positive("Maximum price must be a positive number")
				.optional(),
		),
	isVerified: z.boolean("Is verified must be a boolean").optional(),
});

export function UserProductsFiltersForm({
	defaultValues,
	submitHandler,
	resetHandler,
	className,
	...props
}: ComponentPropsWithoutRef<"form"> & {
	defaultValues: z.infer<typeof userProductsFiltersFormSchema>;
	submitHandler: ({
		data,
	}: {
		data: z.infer<typeof userProductsFiltersFormSchema>;
	}) => void;
	resetHandler: ({
		data,
	}: {
		data: z.infer<typeof userProductsFiltersFormSchema>;
	}) => void;
}) {
	const form = useForm({
		validators: {
			onChange: userProductsFiltersFormSchema,
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
												{field.state.value ?? "Select sort by"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent align="start">
											<SelectGroup>
												{["name", "createdAt"].map((value) => (
													<SelectItem
														key={value}
														value={value}
														className="capitalize"
													>
														{value}
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
												{field.state.value ?? "Select sort order"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent align="start">
											<SelectGroup>
												{["asc", "desc"].map((value) => (
													<SelectItem
														key={value}
														value={value}
														className="capitalize"
													>
														{value}
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
					<form.Field name="minStock">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Minimum stock</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type="number"
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(
												Number.isFinite(e.target.valueAsNumber)
													? e.target.valueAsNumber
													: undefined,
											)
										}
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
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(
												Number.isFinite(e.target.valueAsNumber)
													? e.target.valueAsNumber
													: undefined,
											)
										}
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
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(
												Number.isFinite(e.target.valueAsNumber)
													? e.target.valueAsNumber
													: undefined,
											)
										}
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

							resetHandler({ data: form.state.values });
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
