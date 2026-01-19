import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppPending } from "@/components/blocks/app-pending";
import { ContactForm } from "@/components/forms/contact-form";
import { sendMessage } from "@/remote/public.contact";

export const Route = createFileRoute("/(public)/contact/")({
	head: () => ({
		meta: [
			{
				title: "Contact",
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

function ContactPage() {
	const sendMessageFn = useServerFn(sendMessage);

	const submitContactMutation = useMutation({
		mutationFn: sendMessageFn,
		onSuccess: () => {
			toast.success("Message sent successfully");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<section>
			<div className="container mx-auto py-12 px-4 pt-28 space-y-6 grid gap-6 lg:grid-cols-2 items-start">
				<div className="space-y-2">
					<h2 className="text-3xl font-semibold">Contact</h2>
					<p className="text-muted-foreground">
						Reach out to the EcobuiltConnect team with your sustainable building
						questions or partnership requests.
					</p>
					<ContactForm
						defaultValues={{
							name: "",
							email: "",
							subject: "",
							message: "",
						}}
						isSubmitting={submitContactMutation.isPending}
						submitHandler={({ data }) => {
							submitContactMutation.mutate({ data });
						}}
					/>
				</div>
				<iframe
					src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52980.82232536073!2d18.498110158556987!3d-33.90764174186438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dcc5bada98e54b5%3A0x1012b82d9ba600e3!2sGoodwood%2C%20Cape%20Town%2C%207460!5e0!3m2!1sen!2sza!4v1739165123371!5m2!1sen!2sza"
					loading="eager"
					title="Goodwood, Cape Town, 7460"
					width="100%"
					height="100%"
					className="hidden md:block h-128 rounded-3xl w-full"
				></iframe>
			</div>
		</section>
	);
}
