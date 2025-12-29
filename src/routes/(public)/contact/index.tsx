import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppPending } from "@/components/blocks/app-pending";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/(public)/contact/")({
	head: () => ({
		meta: [
			{
				title: "Contact - EcobuiltConnect",
			},
			{
				name: "description",
				content:
					"Contact EcobuiltConnect support. We are here to help with your sustainable building inquiries.",
			},
		],
	}),
	pendingComponent: AppPending,
	component: ContactPage,
});

const contactFormSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(3, "Name must be at least 3 characters"),
	email: z.email("Email must be a valid email address"),
	subject: z
		.string("Subject must be a string")
		.min(3, "Subject must be at least 3 characters"),
	message: z
		.string("Message must be a string")
		.min(10, "Message must be at least 10 characters"),
});

function ContactPage() {
	const form = useForm({
		validators: {
			onChange: contactFormSchema,
		},
		defaultValues: {
			name: "",
			email: "",
			subject: "",
			message: "",
		} as z.infer<typeof contactFormSchema>,
		onSubmit: async ({ value }) => {
			console.log(value);
		},
	});

	return (
		<section className="container mx-auto py-12 px-4 flex gap-6 items-start">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
				className="flex-1"
			>
				<FieldGroup>
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
										placeholder="John Doe"
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
					<form.Field name="email">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Email</FieldLabel>
									<Input
										id={field.name}
										type="email"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="john@example.com"
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
					<form.Field name="subject">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Subject</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="What is this regarding?"
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
					<form.Field name="message">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Message</FieldLabel>
									<Textarea
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="How can we help?"
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
					<Button type="submit" variant="default" size="lg" className="w-full">
						Send Message
					</Button>
				</FieldGroup>
			</form>
			<iframe
				src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52980.82232536073!2d18.498110158556987!3d-33.90764174186438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dcc5bada98e54b5%3A0x1012b82d9ba600e3!2sGoodwood%2C%20Cape%20Town%2C%207460!5e0!3m2!1sen!2sza!4v1739165123371!5m2!1sen!2sza"
				loading="eager"
				title="Goodwood, Cape Town, 7460"
				width="100%"
				height="100%"
				className="flex-1 hidden md:block h-[512px] rounded-3xl"
			></iframe>
		</section>
	);
}
