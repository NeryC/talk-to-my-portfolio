import { Resend } from "resend";

export interface SendBookingConfirmationArgs {
  to: string;
  name: string;
  role: string;
  bookingId: string;
  confirmationUrl: string;
}

export interface SendBookingConfirmationDeps {
  resend: Resend;
  from: string;
}

export async function sendBookingConfirmation(
  args: SendBookingConfirmationArgs,
  deps: SendBookingConfirmationDeps,
) {
  const html = `
    <p>Hi ${args.name},</p>
    <p>Your 30-minute intro with Nery is booked. Role context: <em>${args.role}</em>.</p>
    <p><a href="${args.confirmationUrl}">View / reschedule / cancel</a></p>
    <p>— Nery</p>
  `;
  return deps.resend.emails.send({
    from: deps.from,
    to: args.to,
    subject: "Your intro call with Nery is confirmed",
    html,
  });
}
