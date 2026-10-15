import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What iuno.lol collects, why, and the choices you have.",
  alternates: {
    canonical: "/privacy",
  },
};

export default async function PrivacyPage() {
  const auth = await isAuthenticated();
  return (
    <>
      <Navbar isAuthenticated={auth} />
      <LegalLayout
        eyebrow="Legal"
        title="Privacy Policy"
        updated="October 13, 2026"
        intro="This policy walks through what we collect, why we collect it, and the choices you have. By using iuno.lol, you consent to the practices described here."
      >
        <LegalSection heading="What we collect">
          <p>
            Account data: your username, email address, password hash or passkey credentials,
            and your Discord ID if you connect Discord. Profile content: everything you put
            on your page, display name, bio, links, widgets, tracks, backgrounds, badges and
            settings. Usage data: profile views, likes, comments, and aggregate counts by
            device type and country. Support messages: anything you send to support@iuno.lol.
          </p>
        </LegalSection>

        <LegalSection heading="Why we collect it">
          <p>
            To run the Service: accounts, pages, widgets, music, badges and the leaderboard
            all need stored data to work. To keep it safe: login security, rate limiting,
            fraud and abuse prevention. To improve it: aggregate stats on which features get
            used. To reach you: password resets, verification emails, and billing receipts.
            We may also send occasional product updates where the law allows it, every one
            of those carries an unsubscribe path.
          </p>
        </LegalSection>

        <LegalSection heading="Cookies">
          <p>
            We use cookies and local storage for the essentials: keeping you signed in,
            remembering player and appearance preferences, and protecting against abuse.
            Blocking essential cookies will break sign in and core features.
          </p>
        </LegalSection>

        <LegalSection heading="Who we share with">
          <p>
            Payment providers process your purchases and see the billing details needed for
            that. Discord shares the profile data you approve when you connect your account.
            We do not sell your personal data to anyone. We may disclose data when the law
            requires it, such as a valid legal request, or to protect the safety of users
            and the Service.
          </p>
        </LegalSection>

        <LegalSection heading="Public pages">
          <p>
            Profile pages can be public depending on your settings. Anything you publish on
            a public page, including your username, content and view counts, can be seen by
            anyone, appear on the leaderboard, and show up in link previews. Only publish
            what you are comfortable sharing.
          </p>
        </LegalSection>

        <LegalSection heading="Deletion and retention">
          <p>
            You can delete your account from settings. Once verified, your personal account
            data and posted content are permanently removed from our active systems. There
            is no undoing it. Some logs and backups linger briefly for security and legal
            compliance, then rotate out automatically. Backing up anything you care about is
            on you.
          </p>
        </LegalSection>

        <LegalSection heading="Your choices">
          <p>
            You can edit or delete your profile content at any time from the dashboard. You
            can disconnect Discord, change your password, and manage passkeys from settings.
            For access, export, or deletion requests beyond what settings cover, email
            support@iuno.lol and we will handle it.
          </p>
        </LegalSection>

        <LegalSection heading="Children">
          <p>
            iuno.lol is not directed at children under 13, and we do not knowingly collect
            their data. If you believe a child under 13 has an account, contact us and we
            will remove it.
          </p>
        </LegalSection>

        <LegalSection heading="Contact">
          <p>
            Privacy questions or requests go to support@iuno.lol with PRIVACY in the subject
            line.
          </p>
        </LegalSection>
      </LegalLayout>
    </>
  );
}
