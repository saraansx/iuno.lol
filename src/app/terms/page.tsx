import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using iuno.lol.",
  alternates: {
    canonical: "/terms",
  },
};

export default async function TermsPage() {
  const auth = await isAuthenticated();
  return (
    <>
      <Navbar isAuthenticated={auth} />
      <LegalLayout
        eyebrow="Legal"
        title="Terms of Service"
        updated="October 13, 2026"
        intro="The ground rules for iuno.lol. Short version: be honest, post only what is yours to share, and we will keep the lights on."
      >
        <LegalSection heading="What this is">
          <p>
            iuno.lol gives you one link that holds your whole internet presence. Links,
            music, widgets, images, all on a single page. You control whether your page is
            public, and public means anyone can see it. So keep it to things you are
            allowed to share.
          </p>
          <p>
            These Terms cover every visit and every account on iuno.lol. When we change
            them, the new version applies from the day it is published. Keep using the
            site after that and you accept the change.
          </p>
        </LegalSection>

        <LegalSection heading="Accounts">
          <p>
            One person, one login. Do not pass your credentials around or sell access.
            What happens on your account counts as you. Sign in with email, a passkey, or
            Discord, and guard those methods. Something look off? Mail support@iuno.lol
            right away.
          </p>
          <p>
            Usernames are first come, first served, with limits. Ours to reclaim are names
            that mislead people, copy someone else identity, offend, break the law, or
            fake an official iuno.lol account.
          </p>
        </LegalSection>

        <LegalSection heading="Stuff you post">
          <p>
            Your page, your responsibility. Every link, file, track and widget on it is
            something you vouch for. Post only work you own or are permitted to use.
          </p>
          <p>
            To show your page at all, we need permission to store and display what you
            upload. That is the whole license: hosting and display so the Service runs.
            Ownership never moves to us.
          </p>
        </LegalSection>

        <LegalSection heading="Off limits">
          <p>
            Illegal content. Other people work passed off as yours. Hate, harassment, or
            sexual content involving minors, zero tolerance there. Scams, phishing, fake
            identities, spam. Malware and attacks on other systems. Anything celebrating
            real violence or exploitation.
          </p>
          <p>
            Same goes for behavior. No poking at our security or rate limits, no scraping
            or botting without written permission, no digging through other users private
            data. Cross a line and we can warn, limit, or remove the account or content,
            immediately where it matters.
          </p>
        </LegalSection>

        <LegalSection heading="Free and Premium">
          <p>
            Free gets you a custom username and page, 1 background, 1 track, 3 widgets,
            core effects, fonts, colors, layouts, plus badges, likes, views and comments.
            Free stays free.
          </p>
          <p>
            Premium is $4.99 once, yours for life. It raises the caps to 5 backgrounds, 10
            tracks and 10 widgets, unlocks every effect, alias tokens, tab customization
            and the Premium badge. Verified and Donator badges, custom badge slots, extra
            aliases and Image Host storage are separate one time purchases. Nothing here
            renews by itself.
          </p>
        </LegalSection>

        <LegalSection heading="Paying and refunds">
          <p>
            Prices show pre-tax. Checkout adds taxes and processing fees based on where you
            are. Our payment providers handle the charge. Find a pricing mistake and we
            can correct it after the fact.
          </p>
          <p>
            All sales are final. No refunds for changing your mind or for features you
            never used. Billing errors are the exception: wrong amount, double charge, or
            a paid feature that never arrived. Those we refund or credit. Write to
            support@iuno.lol with the details. Disputing a valid charge through your bank
            instead can get the account suspended until it is settled.
          </p>
        </LegalSection>

        <LegalSection heading="Uploads">
          <p>
            Image Host is for your page content, screenshots, clips, images you actually
            share. Not a CDN for apps, not bot storage, not a hotlink farm. Abuse it and
            expect tighter limits or losing the feature.
          </p>
          <p>
            Tracks accept MP3, M4A, OGG, FLAC and WAV up to 15MB. Backgrounds go up to
            10MB free, videos up to 100MB on Premium. Badge icons must be original work
            you made.
          </p>
        </LegalSection>

        <LegalSection heading="Other services">
          <p>
            Discord and other connections are optional. Connect one and we store whatever
            that service shares with your permission. Their rules govern their side, we
            govern ours. Links you add leave our site, and what is on the other end is not
            ours to vouch for.
          </p>
        </LegalSection>

        <LegalSection heading="Leaving and removal">
          <p>
            Delete your account any time and you are out. We can suspend or remove
            accounts and content for rule breaking, fraud, unpaid bills, or legal reasons.
            Rights you had under these Terms end when access ends.
          </p>
        </LegalSection>

        <LegalSection heading="Contact">
          <p>
            support@iuno.lol for everything, users and legal alike. Put LEGAL in the
            subject for law enforcement and rights holder matters.
          </p>
        </LegalSection>
      </LegalLayout>
    </>
  );
}
