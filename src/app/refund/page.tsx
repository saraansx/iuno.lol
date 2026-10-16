import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "How refunds work on iuno.lol.",
  alternates: {
    canonical: "/refund",
  },
};

export default async function RefundPage() {
  const auth = await isAuthenticated();
  return (
    <>
      <Navbar isAuthenticated={auth} />
      <LegalLayout
        eyebrow="Legal"
        title="Refund Policy"
        updated="October 13, 2026"
        intro="Every purchase on iuno.lol, Premium, badges, tokens and Image Host storage, is a one time payment. There are no subscriptions and nothing renews on its own."
      >
        <LegalSection heading="Final sale">
          <p>
            Payments are final. We do not refund for change of mind, for features you did
            not end up using, or for partial use of a plan. Before buying, check the plan
            details on the pricing page so you know exactly what you get.
          </p>
        </LegalSection>

        <LegalSection heading="When we do refund">
          <p>
            When we mess up the billing, we fix it. That covers being charged the wrong
            amount, duplicate charges for the same purchase, and paid features that never
            got delivered to your account. In those cases we refund or credit the
            difference at our discretion.
          </p>
        </LegalSection>

        <LegalSection heading="How to request one">
          <p>
            Email support@iuno.lol with REFUND in the subject line and include the email on
            your account, the date and amount of the charge, and what went wrong. We review
            requests case by case and reply with the outcome.
          </p>
        </LegalSection>

        <LegalSection heading="Chargebacks">
          <p>
            Filing a chargeback or payment dispute against a charge that is actually valid
            breaks our Terms. Where that happens, we can suspend the account and pull access
            to anything bought until the dispute is closed. Talk to us first, it is faster
            for both sides.
          </p>
        </LegalSection>
      </LegalLayout>
      <Footer />
    </>
  );
}
