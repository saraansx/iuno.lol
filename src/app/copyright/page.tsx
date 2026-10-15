import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Copyright Policy",
  description: "How iuno.lol handles copyright reports and counter notices.",
  alternates: {
    canonical: "/copyright",
  },
};

export default async function CopyrightPage() {
  const auth = await isAuthenticated();
  return (
    <>
      <Navbar isAuthenticated={auth} />
      <LegalLayout
        eyebrow="Legal"
        title="Copyright Policy"
        updated="October 13, 2026"
        intro="We respect the work of creators, and we expect the same on iuno.lol pages. This policy explains how to report infringement and what happens next."
      >
        <LegalSection heading="Your work stays yours">
          <p>
            Everything you post on your page remains your property. Our Terms only ask for
            the narrow license needed to host and display it. Your own uploads, tracks,
            artwork and custom badge icons must be your original work or something you have
            permission to use.
          </p>
        </LegalSection>

        <LegalSection heading="Reporting infringement">
          <p>
            If you believe content on iuno.lol infringes your copyright, email
            support@iuno.lol with COPYRIGHT in the subject line and include: the work you
            own, the page or file that infringes it, your contact details, a statement that
            you believe in good faith the use is unauthorized, and a statement that your
            notice is accurate. False reports can get your own account restricted, so only
            report work you actually own.
          </p>
        </LegalSection>

        <LegalSection heading="What we do">
          <p>
            Valid reports get the content restricted or removed, and the account behind it
            notified. Repeat infringers lose their accounts. If a report looks invalid or
            abusive, we reject it and may restrict the reporter instead.
          </p>
        </LegalSection>

        <LegalSection heading="Counter notices">
          <p>
            If your content was removed and you believe that was a mistake, reply to our
            notice with an explanation and proof of your rights. We review counter notices
            case by case and restore content when the claim does not hold up.
          </p>
        </LegalSection>

        <LegalSection heading="Badges and assets">
          <p>
            Custom badges must be your own original work. No cloning or near copies of
            official iuno.lol badges or system marks. Badges that copy ours or anyone
            else work get pulled, and abusing the badge system can cost customization
            access entirely.
          </p>
        </LegalSection>
      </LegalLayout>
    </>
  );
}
