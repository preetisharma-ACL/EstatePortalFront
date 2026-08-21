import { Title, Meta, Link } from "@solidjs/meta";
import { A } from "@solidjs/router";
import LegalPage, { LegalContact, type LegalSection } from "~/components/LegalPage";
import { COMPANY } from "~/lib/company";
import { canonical } from "~/lib/seo";

const SECTIONS: LegalSection[] = [
  {
    id: "scope",
    title: "Who this policy applies to",
    content: () => (
      <>
        <p>
          {COMPANY.brand} ({COMPANY.website}) is a property discovery and advisory platform
          operated by <strong>{COMPANY.legalName}</strong> ("we", "us", "our"). It lists
          RERA-verified residential and commercial projects across India and connects
          interested buyers and investors with our advisory team and with verified
          developers and channel partners.
        </p>
        <p>
          This policy explains what personal data we collect when you browse the site or
          submit an enquiry, why we collect it, who we share it with, how long we keep it,
          and the rights you have over it. It applies to every page of {COMPANY.website} and
          to every enquiry form on the site, including the pop-up enquiry form and the
          project-level enquiry forms.
        </p>
        <p>
          We process personal data in accordance with the{" "}
          <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the
          Information Technology Act, 2000 and the rules made under them. In DPDP terms, we
          are the <strong>Data Fiduciary</strong> and you are the <strong>Data Principal</strong>.
        </p>
        <p>
          If you do not agree with this policy, please do not submit an enquiry through the
          site.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    content: () => (
      <>
        <p>
          You can browse projects, cities, localities and developer profiles on{" "}
          {COMPANY.brand} <strong>without giving us any personal details</strong>. We only
          collect personal data when you choose to give it to us, or when it is generated
          automatically as you use the site.
        </p>

        <h3>a. Details you give us in an enquiry form</h3>
        <p>
          When you request a callback, download a brochure or submit a project enquiry, we
          collect:
        </p>
        <ul>
          <li>
            <strong>Full name</strong> and <strong>phone number</strong> — mandatory, so an
            advisor can reach you.
          </li>
          <li>
            <strong>Email address</strong> — where the form asks for it.
          </li>
          <li>
            <strong>Requirement details</strong> — your minimum and maximum budget, purpose
            (investment, end use or both), configuration preference (for example 3 BHK),
            purchase timeline and any free-text message you write.
          </li>
          <li>
            <strong>Context of the enquiry</strong> — the project and city the enquiry was
            made against, so the right advisor picks it up.
          </li>
          <li>
            <strong>Your consent</strong> — the fact that you ticked the consent box, which
            we record with the enquiry.
          </li>
        </ul>

        <h3>b. Campaign and referral information</h3>
        <p>
          If you arrive from an advertisement, an email campaign or a partner link, the URL
          may carry campaign parameters — <strong>utm_source, utm_medium, utm_campaign,
          utm_term, utm_content</strong> — or a click identifier from an advertising
          platform (<strong>gclid</strong> for Google, <strong>fbclid</strong> for Meta). We
          read these from the URL, store them in your browser's session storage for the
          duration of your visit, and attach them, along with the first page you landed on,
          to any enquiry you submit. This tells us which campaigns actually help people and
          lets us stop paying for the ones that do not.
        </p>

        <h3>c. Technical and usage information</h3>
        <p>
          Like any website, our servers and hosting providers automatically log basic
          technical information when a page is requested — IP address, browser and device
          type, operating system, referring URL, the pages viewed and the date and time. We
          use this for security, fraud prevention, debugging and aggregate traffic analysis.
        </p>

        <h3>What we do not collect</h3>
        <p>
          We do not ask for and do not want financial account details, card numbers, PAN,
          Aadhaar or any other government identifier through this website. {COMPANY.brand}{" "}
          does not accept payments online. If anyone asks you to transfer money or share
          such documents in our name through this site, treat it as fraudulent and report it
          to us at{" "}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    content: () => (
      <>
        <p>We use the personal data described above only for these purposes:</p>
        <ul>
          <li>
            <strong>To respond to your enquiry</strong> — to call, SMS, WhatsApp or email you
            about the property or requirement you enquired about, share project details,
            pricing, floor plans and brochures, and arrange site visits.
          </li>
          <li>
            <strong>To match you with suitable inventory</strong> — to shortlist
            RERA-verified projects that fit the budget, configuration and purpose you told
            us about, and to introduce you to the relevant developer or channel partner.
          </li>
          <li>
            <strong>To follow up on your requirement</strong> — including telling you about
            comparable or newly launched projects that fit the requirement you shared, until
            you tell us to stop.
          </li>
          <li>
            <strong>To operate and improve the site</strong> — measuring which projects,
            cities and campaigns people find useful, fixing errors, and keeping the platform
            secure.
          </li>
          <li>
            <strong>To meet legal obligations</strong> — responding to lawful requests from
            courts, regulators or law-enforcement agencies, and keeping records we are
            required to keep.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> sell your personal data. We do not run automated
          decision-making or profiling that produces legal effects for you.
        </p>
      </>
    ),
  },
  {
    id: "consent",
    title: "Consent, and how to withdraw it",
    content: () => (
      <>
        <p>
          Every enquiry form on {COMPANY.brand} carries a mandatory consent checkbox. By
          ticking it you agree to be contacted by {COMPANY.legalName} and its verified
          partners about that enquiry by phone call, SMS, WhatsApp or email, and you consent
          to your personal data being processed for that purpose under the DPDP Act. The
          form cannot be submitted without it, and we record the consent with the enquiry.
        </p>
        <p>
          <strong>Your consent is specific, informed and freely given, and you can withdraw
          it at any time.</strong> To withdraw, write to{" "}
          <a href={`mailto:${COMPANY.grievanceEmail}`}>{COMPANY.grievanceEmail}</a> and ask to
          be removed. We will stop contacting you and delete or anonymise your details unless
          we are required by law to keep them.
        </p>
        <p>
          Withdrawing consent does not affect processing already carried out while consent
          was valid, and it may mean we can no longer assist with an enquiry in progress.
        </p>
        <h3>Calls and messages</h3>
        <p>
          Because you have given express consent, our calls and messages relating to your
          enquiry may reach you even if your number is registered on the DND / NCPR list
          maintained under the TRAI Telecom Commercial Communications Customer Preference
          Regulations. You can end this at any time by telling the caller, replying STOP to
          a message, or contacting us at the address above.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share your information with",
    content: () => (
      <>
        <p>
          The core purpose of an enquiry is to put you in touch with the right people, so
          your details are shared — but only as described here:
        </p>
        <ul>
          <li>
            <strong>Developers and their authorised sales teams</strong> — when you enquire
            about a specific project, your name, phone number and stated requirement are
            shared with that project's developer or its authorised sales representative so
            they can respond, register your visit and comply with their own RERA record
            keeping.
          </li>
          <li>
            <strong>Verified channel partners and advisors</strong> — associates on our panel
            who handle enquiries in a particular city or micro-market, under an obligation to
            use the data only for your enquiry.
          </li>
          <li>
            <strong>Service providers</strong> — hosting, cloud storage, CRM, telephony,
            messaging and analytics vendors who process data on our instructions and are
            contractually bound to protect it.
          </li>
          <li>
            <strong>Legal and regulatory recipients</strong> — courts, regulators, RERA
            authorities and law-enforcement agencies where disclosure is required by law or
            needed to establish, exercise or defend a legal claim.
          </li>
          <li>
            <strong>A successor entity</strong> — if our business is merged, acquired or
            reorganised, under the same protections as this policy.
          </li>
        </ul>
        <p>
          Once your details reach a developer or channel partner, that entity handles them as
          an independent data fiduciary under its own privacy policy. We ask our partners to
          use enquiry data only to respond to you, but we cannot control their internal
          practices. If a partner contacts you in a way you did not agree to, tell us and we
          will take it up with them.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies, browser storage and analytics",
    content: () => (
      <>
        <h3>Browser storage set by us</h3>
        <p>
          {COMPANY.brand} does not set advertising cookies of its own. What it does use is
          your browser's <strong>session storage</strong>, which is cleared automatically
          when you close the tab:
        </p>
        <ul>
          <li>
            <strong>Campaign attribution</strong> — the UTM and click-ID values described in
            section 2, so that an enquiry made after browsing several pages still carries the
            campaign you arrived from.
          </li>
          <li>
            <strong>Enquiry pop-up state</strong> — a single flag recording that the enquiry
            pop-up has already been shown, so it does not reappear on every page during the
            same visit.
          </li>
        </ul>

        <h3>Google Analytics</h3>
        <p>
          Every page of this site loads <strong>Google Analytics 4</strong> (the Google tag,
          gtag.js). Google sets its own cookies and identifiers in your browser and processes
          your IP address, device and browser information, the pages you view and how you
          move between them. We use the resulting reports, which are aggregated, to
          understand which projects, cities and campaigns people find useful and to improve
          the site — not to identify you personally.
        </p>
        <p>
          Google acts as our processor for this and handles the data under its own privacy
          policy at{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            policies.google.com/privacy
          </a>
          . You can opt out across all sites by installing the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Analytics Opt-out Browser Add-on
          </a>
          .
        </p>

        <h3>Managing this</h3>
        <p>
          You can block or delete cookies and clear site storage through your browser
          settings, and most browsers offer a "do not track" or anti-tracking mode. The site
          remains fully usable if you do, though the enquiry pop-up may reappear on your next
          visit. Any additional analytics, remarketing or conversion-measurement tools we add
          in future will be reflected on this page.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep your data",
    content: () => (
      <>
        <p>
          We keep enquiry data only as long as it serves the purpose you gave it for, plus
          any period we are legally required to retain it:
        </p>
        <ul>
          <li>
            <strong>Active enquiries</strong> — for as long as we are assisting you, and for
            up to <strong>36 months</strong> after our last interaction, because property
            decisions typically play out over months or years and buyers often return to the
            same requirement.
          </li>
          <li>
            <strong>Withdrawn consent or a deletion request</strong> — we act on it within{" "}
            <strong>30 days</strong>, keeping only a minimal suppression record (your phone
            number or email) so that we do not contact you again by mistake.
          </li>
          <li>
            <strong>Technical logs</strong> — typically 12 months, for security and
            diagnostics.
          </li>
          <li>
            <strong>Records required by law</strong> — for the period the relevant law
            prescribes.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect your data",
    content: () => (
      <>
        <p>
          We apply reasonable security safeguards appropriate to the sensitivity of the data
          we hold: encrypted transport (HTTPS) across the site, access controls so that only
          advisors handling your enquiry can see it, restricted administrative access to our
          systems, and contractual confidentiality obligations on our staff and partners.
        </p>
        <p>
          No method of transmission or storage is completely secure, and we cannot guarantee
          absolute security. If a personal data breach affecting you occurs, we will notify
          you and the Data Protection Board of India as required under the DPDP Act.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights under the DPDP Act",
    content: () => (
      <>
        <p>As a Data Principal you have the right to:</p>
        <ul>
          <li>
            <strong>Access</strong> — obtain a summary of the personal data we hold about
            you, how we are processing it, and the identities of the parties we have shared
            it with.
          </li>
          <li>
            <strong>Correction and completion</strong> — have inaccurate or incomplete data
            corrected, completed or updated.
          </li>
          <li>
            <strong>Erasure</strong> — have your personal data deleted once the purpose is
            served, unless retention is required by law.
          </li>
          <li>
            <strong>Withdraw consent</strong> — as easily as you gave it (see section 4).
          </li>
          <li>
            <strong>Grievance redressal</strong> — raise a complaint with our Grievance
            Officer, and escalate to the Data Protection Board of India if you are not
            satisfied with the outcome.
          </li>
          <li>
            <strong>Nominate</strong> — nominate another individual to exercise these rights
            on your behalf in the event of your death or incapacity.
          </li>
        </ul>
        <p>
          To exercise any of these, email{" "}
          <a href={`mailto:${COMPANY.grievanceEmail}`}>{COMPANY.grievanceEmail}</a> from the
          address you enquired with. We may ask you to verify your identity — usually by
          confirming the phone number used in the enquiry — before we act, so that nobody
          else can access or delete your data.
        </p>
        <p>
          You also have a duty under the DPDP Act not to impersonate anyone else, not to
          suppress material information, and not to file false or frivolous complaints.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's data",
    content: () => (
      <p>
        {COMPANY.brand} is meant for adults transacting in real estate and is not directed at
        children. We do not knowingly collect personal data of anyone below 18 years of age.
        If you believe a child has submitted personal data to us, write to{" "}
        <a href={`mailto:${COMPANY.grievanceEmail}`}>{COMPANY.grievanceEmail}</a> and we will
        delete it.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-party links and content",
    content: () => (
      <p>
        The site links out to state RERA authority portals so you can verify registration
        details independently, and to developer websites, brochures, maps and video content.
        These destinations are outside our control and are governed by their own privacy
        policies. We are not responsible for how they collect or use your information —
        please read their policies before sharing anything with them.
      </p>
    ),
  },
  {
    id: "transfers",
    title: "Storage and cross-border transfer",
    content: () => (
      <p>
        Your personal data is primarily stored and processed in India. Some of our hosting,
        cloud, analytics or messaging providers may process data on servers located outside
        India. Where that happens, the transfer is made in accordance with section 16 of the
        DPDP Act and comparable safeguards are imposed on the recipient by contract.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: () => (
      <p>
        We may update this policy to reflect changes in our practices, our services or the
        law. The revised version will be posted on this page with a new "Last updated" date,
        and material changes will be highlighted on the site. Please review this page
        periodically. Continuing to use {COMPANY.brand} after an update means you accept the
        revised policy.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Grievance Officer and contact",
    content: () => (
      <>
        <p>
          For any question, request or complaint about your personal data — including access,
          correction, erasure or withdrawal of consent — contact our Grievance Officer,
          appointed under the DPDP Act, 2023 and the Information Technology (Intermediary
          Guidelines and Digital Media Ethics Code) Rules, 2021:
        </p>
        <LegalContact
          role="Grievance Officer"
          name={COMPANY.grievanceOfficer}
          email={COMPANY.grievanceEmail}
        />
        <p>
          If your complaint is not resolved to your satisfaction, you may escalate it to the{" "}
          <strong>Data Protection Board of India</strong> under the DPDP Act, 2023. See also
          our <A href="/terms">Terms &amp; Conditions</A>, which govern your use of this
          website.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Title>Privacy Policy | {COMPANY.brand}</Title>
      <Meta
        name="description"
        content={`How ${COMPANY.brand} collects, uses, shares and protects your personal data when you browse projects or submit a property enquiry — written for India's DPDP Act, 2023.`}
      />
      <Meta name="robots" content="index,follow" />
      <Link rel="canonical" href={canonical("/privacy-policy")} />

      <LegalPage
        eyebrow="Legal & policy"
        heading="Privacy"
        headingAccent="policy"
        intro={`Your details are used to help you find the right property — nothing else. This page sets out exactly what we collect when you enquire, who we pass it to, how long we keep it, and how to have it corrected or deleted.`}
        sections={SECTIONS}
      />
    </>
  );
}
