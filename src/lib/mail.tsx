import { OrderCreated, UserLock } from "@/types";
import { Resend } from "resend";
import { formatDate } from "@/lib/time";
import { ReactNode } from "react";
import EmailTemplate from "@/components/email/email-template";
import { Heading, Hr, Link, Text } from "react-email";
import { h2, h2First, hr, text } from "@/components/email/styles";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromDomain = process.env.RESEND_DOMAIN;

async function sendMail(email: string, subject: string, react: ReactNode) {
  const { error } = await resend.emails.send({
    from: `Norges Kubeforbund <info@${fromDomain}>`,
    to: email,
    subject: subject,
    react: react,
    replyTo: "kontakt@kubing.no",
  });
  if (error) {
    console.error("Failed:", error.message);
    return;
  }
}

export async function sendMembershipConfirmation(user: UserLock, order: OrderCreated) {
  const { email } = user;
  const name = user.name;
  const { id: orderNumber, year } = order;
  const react = (
    <EmailTemplate>
      <Heading as="h2" style={h2First}>Du er medlem i Norges Kubeforbund!</Heading>
      <Text style={text}>Kjære {name},</Text>
      <Text style={text}>Dette er en bekreftelse på at du har betalt og er nå registrert som medlem
        i Norges Kubeforbund for året {year}. Medlemskapet varer ut kalenderåret.
      </Text>
      <Text style={text}>Ditt referansenummer for betalingen er #{orderNumber}.</Text>
      <Text style={text}>Takk for at du bidrar til å støtte NKF!
        Vi ser frem til å ha deg som medlem og ønsker deg et hyggelig medlemskap hos NKF.</Text>
      <Text style={text}>Med vennlig hilsen,<br />Norges Kubeforbund</Text>

      <Hr style={hr} />

      <Heading as="h2" style={h2}>You are a member of Norges Kubeforbund!</Heading>
      <Text style={text}>Dear {name},</Text>
      <Text style={text}>This is a confirmation of payment and you are now registered as a member
        of Norges Kubeforbund for the year {year}. The membership lasts through the end of the calendar year.
      </Text>
      <Text style={text}>Your reference number for the payment is #{orderNumber}.</Text>
      <Text style={text}>Thank you for supporting NKF!
        We look forward to having you as a member and wish
        you a pleasant membership experience with NKF.</Text>
      <Text style={text}>Best regards,<br />Norges Kubeforbund</Text>
    </EmailTemplate>
  );
  await sendMail(email, `Bekreftelse på medlemskap hos Norges Kubeforbund ${year}`, react);
}

export async function notifyOfPaymentDue(user: UserLock, price: string, due: string) {
  const { email } = user;
  const name = user.name;
  const { norwegian: norwegianDueDate, english: englishDueDate } = formatDate(due);
  const react = (
    <EmailTemplate>
      <Text style={text}>Kjære {name},</Text>
      <Text style={text}>Vi ønsker å informere om at ditt medlemskap hos NKF vil fornyes
        for {price} kroner den {norwegianDueDate}.
      </Text>
      <Text style={text}>Hvis du ikke lenger ønsker å være medlem, kan du avslutte automatisk fornyelse
        på <Link href="https://kubing.no/min-side/innstillinger">Min side</Link> eller
        direkte i Vipps-appen.
      </Text>
      <Text style={text}>Takk for at du er medlem i NKF!</Text>
      <Text style={text}>Med vennlig hilsen,<br />Norges Kubeforbund</Text>

      <Hr style={hr} />

      <Text style={text}>Dear {name},</Text>
      <Text style={text}>We want to let you know that your membership with NKF will be renewed
        for {price} kroner on {englishDueDate}.
      </Text>
      <Text style={text}>If you no longer wish to be a member, you can end the automatic renewal
        at <Link href="https://kubing.no/min-side/innstillinger">My page</Link> or
        directly in the Vipps app.
      </Text>
      <Text style={text}>Thank you for being a member of NKF!</Text>
      <Text style={text}>Best regards,<br />Norges Kubeforbund</Text>
    </EmailTemplate>
  );
  await sendMail(email, "Kommende fornyelse av medlemskap i Norges Kubeforbund", react);
}

export async function notifyOfAgreementEndedAfterFailedCharge(user: UserLock) {
  const { email } = user;
  const name = user.name;
  const react = (
    <EmailTemplate>
      <Text style={text}>Kjære {name},</Text>
      <Text style={text}>Vi ønsker å informere om at din betaling for medlemskap hos NKF feilet
        etter gjentatte forsøk fra Vipps. Vi har derfor avsluttet din automatisk fornyelse.
      </Text>
      <Text style={text}>Hvis du fortsatt ønsker å være medlem i NKF, må du gå inn
        på <Link href="https://kubing.no/min-side">Min side</Link> og sette opp
        automatisk fornyelse på nytt eller betale for medlemskap for i år.
      </Text>
      <Text style={text}>Med vennlig hilsen,<br />Norges Kubeforbund</Text>

      <Hr style={hr} />

      <Text style={text}>Dear {name},</Text>
      <Text style={text}>We want to let you know that your payment for membership with NKF failed
        after repeated attempts from Vipps. We have therefore ended your automatic payment.
      </Text>
      <Text style={text}>If you still wish to be a member of NKF, you have to go
        to <Link href="https://kubing.no/min-side">My page</Link> and set up
        automatic renewal again or pay for membership for this year.
      </Text>
      <Text style={text}>Best regards,<br />Norges Kubeforbund</Text>
    </EmailTemplate>
  );
  await sendMail(email, "Betaling feilet for medlemskap i Norges Kubeforbund", react);
}
