import { Title, Meta, Link } from "@solidjs/meta";
import { A } from "@solidjs/router";
import LegalPage, { LegalContact, type LegalSection } from "~/components/LegalPage";
import { COMPANY } from "~/lib/company";

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    content: () => (
      <>
        <p>
          These Terms &amp; Conditions govern your access to and use of {COMPANY.website} and
          every page, listing, search result, brochure, form and service made available
          through it (together, the "Platform"). The Platform is owned and operated by{" "}
          <strong>{COMPANY.legalName}</strong> ("{COMPANY.brand}", "we", "us", "our").
        </p>
        <p>
          By browsing the Platform, submitting an enquiry or otherwise using any feature, you
          confirm that you have read, understood and agreed to these terms and to our{" "}
          <A href="/privacy-policy">Privacy Policy</A>, which forms part of them.{" "}
          <strong>If you do not agree, please stop using the Platform.</strong>
        </p>
        <p>
          These terms constitute an electronic record under the Information Technology Act,
          2000 and the rules made under it, and do not require a physical or digital
          signature.
        </p>
      </>
    ),
  },
  {
    id: "what-we-are",
    title: "What EstatePortal is — and is not",
    content: () => (
      <>
        <p>
          {COMPANY.brand} is a <strong>property discovery, information and advisory
          platform</strong>. We aggregate and present details of RERA-registered residential
          and commercial projects across India, help you search and compare them, and put you
          in touch with the relevant developer, their authorised sales team or a verified
          channel partner.
        </p>
        <p>To be unambiguous about our role:</p>
        <ul>
          <li>
            We are <strong>not the owner, seller, developer or promoter</strong> of any
            property listed on the Platform.
          </li>
          <li>
            We are <strong>not a party to any transaction</strong> between you and a
            developer, owner or channel partner. Any booking, allotment, agreement to sell,
            sale deed, lease or payment is strictly between you and that party.
          </li>
          <li>
            We do not accept booking amounts, tokens or any other payment from buyers through
            this Platform. <strong>Never transfer money to anyone in our name.</strong>
          </li>
          <li>
            We give no assurance as to the performance, delivery, quality, timeline, title or
            legal standing of any project or developer.
          </li>
          <li>
            Listing a project on the Platform is not an endorsement, recommendation or offer
            to sell, and does not constitute an invitation to invest.
          </li>
        </ul>
        <p>
          To the extent we act as an intermediary hosting third-party information, we do so
          within the meaning of the Information Technology Act, 2000 and the Information
          Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility and permitted use",
    content: () => (
      <>
        <p>
          You may use the Platform only if you are at least 18 years old and competent to
          contract under the Indian Contract Act, 1872. If you use the Platform on behalf of
          a company, firm or trust, you confirm you are authorised to bind that entity.
        </p>
        <p>
          Browsing does not require an account. Where you submit an enquiry, you must provide
          accurate, current and complete information and must not impersonate anyone else or
          submit another person's contact details without their permission.
        </p>
      </>
    ),
  },
  {
    id: "property-information",
    title: "Property information, RERA and accuracy",
    content: () => (
      <>
        <p>
          Project information on the Platform — names, locations, configurations, carpet and
          built-up areas, pricing, price per sq. ft., possession status, amenities, floor
          plans, images, videos, brochures, developer profiles and RERA registration details
          — is sourced from developers, their authorised representatives and publicly
          available records. It is presented in good faith but is{" "}
          <strong>indicative only</strong>.
        </p>
        <p>
          We display the RERA registration number, phase and authority for listed projects,
          along with a route to the official state authority portal.{" "}
          <strong>
            The RERA registration details shown here are a convenience, not a certification.
            Before you pay any amount or sign any document, verify the registration, the
            approved plans, the sanctioned layout, the promoter's details and the project
            status directly on the official RERA portal of the relevant state.
          </strong>{" "}
          Where anything on this Platform conflicts with the RERA portal or the developer's
          own documentation, those official sources prevail.
        </p>
        <p>
          Prices, offers, inventory and availability change frequently and without notice, and
          the figures shown exclude stamp duty, registration charges, GST, maintenance,
          parking, club and other statutory or developer charges unless expressly stated.
          Images, renders, elevations, walkthroughs and floor plans are artistic impressions
          and may differ from the constructed property. Distances, connectivity and
          neighbourhood claims are approximate.
        </p>
        <p>
          We make reasonable efforts to keep listings accurate and current but do not warrant
          that any information is error-free, complete or up to date. If you spot an
          inaccuracy, please report it to{" "}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and we will review it.
        </p>
      </>
    ),
  },
  {
    id: "enquiries",
    title: "Enquiries, callbacks and communication",
    content: () => (
      <>
        <p>
          When you submit an enquiry — through a project page, the site-wide enquiry form or
          the pop-up form — you expressly authorise {COMPANY.legalName} and its verified
          partners to contact you by <strong>phone call, SMS, WhatsApp and email</strong>{" "}
          about that enquiry and about comparable properties, and you consent to your details
          being shared with the relevant developer or channel partner for that purpose. This
          consent operates notwithstanding any DND / NCPR registration on your number.
        </p>
        <p>
          Submitting an enquiry does not create any obligation on us to provide services, nor
          any right to a particular property, price, discount or site visit. Site visits,
          brochures and pricing sheets are arranged subject to developer availability.
        </p>
        <p>
          You can withdraw your consent and opt out of further communication at any time by
          writing to{" "}
          <a href={`mailto:${COMPANY.grievanceEmail}`}>{COMPANY.grievanceEmail}</a> or telling
          the advisor who contacts you. See the{" "}
          <A href="/privacy-policy">Privacy Policy</A> for how your enquiry data is handled.
        </p>
      </>
    ),
  },
  {
    id: "no-advice",
    title: "No professional or investment advice",
    content: () => (
      <>
        <p>
          Content on the Platform — including investment collections, "luxury", "premium" or
          "investment picks" groupings, yield or appreciation commentary, and advisory
          conversations — is <strong>general information, not professional advice</strong>. It
          is not investment, financial, legal, tax, valuation or architectural advice, and it
          does not take your personal circumstances into account.
        </p>
        <p>
          Real estate values can go down as well as up, and past performance of a locality,
          developer or asset class does not guarantee future returns. Before transacting, you
          must carry out your own due diligence and take independent advice from a qualified
          advocate, chartered accountant, valuer or financial adviser. Any decision you take
          is your own.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: () => (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>
            use the Platform for any unlawful, fraudulent or misleading purpose, or in breach
            of RERA, consumer protection, competition, tax or anti-money-laundering law;
          </li>
          <li>
            scrape, crawl, harvest, mirror, frame or systematically extract listings, images,
            developer data or contact information, or use bots, scripts or automated tools
            against the Platform, without our prior written permission;
          </li>
          <li>
            submit false, fake, duplicate or automated enquiries, or another person's details
            without their consent;
          </li>
          <li>
            copy, reproduce or republish our content or design for a competing property
            portal or listing service;
          </li>
          <li>
            attempt to gain unauthorised access to the Platform, its servers or its APIs,
            probe or test its security, or interfere with its normal operation;
          </li>
          <li>
            upload or transmit any virus, malware or harmful code, or any content that is
            defamatory, obscene, infringing, harassing or otherwise unlawful;
          </li>
          <li>
            misrepresent yourself as an employee, agent, advisor or authorised partner of{" "}
            {COMPANY.brand}, or collect money in our name.
          </li>
        </ul>
        <p>
          We may suspend or block access, remove content and pursue legal remedies for any
          breach of this section.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    content: () => (
      <>
        <p>
          The Platform's design, layout, user interface, text, graphics, logos, trade marks,
          compilations, curated collections and underlying software are owned by or licensed
          to {COMPANY.legalName} and are protected by Indian and international intellectual
          property law. The {COMPANY.brand} name and logo may not be used without our prior
          written consent.
        </p>
        <p>
          Project names, developer logos, brochures, renders, photographs and floor plans
          belong to the respective developers or their licensors and are displayed with
          permission or under fair use for the purpose of marketing those projects.
        </p>
        <p>
          You may view, download and print content from the Platform for your own personal,
          non-commercial use in evaluating a property. Any other use — reproduction,
          distribution, modification, publication or commercial exploitation — requires our
          written consent.
        </p>
        <p>
          If you believe content on the Platform infringes your rights, write to{" "}
          <a href={`mailto:${COMPANY.grievanceEmail}`}>{COMPANY.grievanceEmail}</a> with
          details of the work, the URL complained of and proof of your rights. We will act on
          valid complaints promptly.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "Third-party content and links",
    content: () => (
      <p>
        The Platform contains links to state RERA authority portals, developer websites,
        maps, video hosts and other third-party resources, and hosts information supplied by
        developers and channel partners. We do not control, endorse or take responsibility
        for third-party content, products, services or practices. Your dealings with any
        third party you reach through the Platform — including any developer or channel
        partner — are solely between you and them.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer of warranties",
    content: () => (
      <>
        <p>
          The Platform and all information on it are provided on an{" "}
          <strong>"as is" and "as available"</strong> basis. To the fullest extent permitted
          by law, we disclaim all warranties, express or implied, including any warranty of
          accuracy, completeness, merchantability, fitness for a particular purpose,
          non-infringement, title, or uninterrupted or error-free availability.
        </p>
        <p>
          We do not warrant that any project will be completed, delivered on time, registered,
          or will match the description, images or pricing shown; that any developer or
          partner will perform its obligations; or that the Platform will be free of
          interruption, defects or security vulnerabilities. Access may be suspended for
          maintenance, upgrades or reasons beyond our control.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: () => (
      <>
        <p>
          To the fullest extent permitted by applicable law, {COMPANY.legalName}, its
          directors, employees, advisors and partners shall not be liable for any indirect,
          incidental, special, consequential, punitive or exemplary loss, or for loss of
          profit, opportunity, goodwill, savings or data, arising out of or in connection with
          your use of the Platform or reliance on any information on it.
        </p>
        <p>
          In particular, we are not liable for any loss arising from: inaccuracies in
          listing, pricing or RERA information; delay, default, cancellation, deficiency or
          misrepresentation by a developer, owner or channel partner; any transaction you
          enter into; or any decision you take based on Platform content.
        </p>
        <p>
          Where liability cannot be excluded, our aggregate liability to you for all claims
          arising out of or relating to the Platform shall not exceed{" "}
          <strong>₹10,000 (Rupees ten thousand)</strong> or the amount you have actually paid
          us for services, whichever is higher.
        </p>
        <p>
          Nothing in these terms excludes or limits liability that cannot lawfully be excluded,
          including liability for fraud or for death or personal injury caused by negligence.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    content: () => (
      <p>
        You agree to indemnify and hold harmless {COMPANY.legalName}, its directors,
        employees, advisors and partners from and against any claim, demand, loss, liability,
        cost or expense (including reasonable legal fees) arising out of your breach of these
        terms, your misuse of the Platform, your violation of any law or third-party right,
        or any information you submit through the Platform.
      </p>
    ),
  },
  {
    id: "privacy",
    title: "Privacy and data protection",
    content: () => (
      <p>
        Personal data you provide is handled in accordance with our{" "}
        <A href="/privacy-policy">Privacy Policy</A> and the Digital Personal Data Protection
        Act, 2023. By using the Platform you acknowledge that policy, including the sharing of
        enquiry details with the developers and verified partners relevant to your enquiry.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to the Platform and to these terms",
    content: () => (
      <p>
        We may add, modify, suspend or withdraw any part of the Platform — including listings,
        features and collections — at any time without notice. We may also revise these terms;
        the revised version takes effect when posted on this page with an updated date.
        Continuing to use the Platform after that means you accept the revised terms, so
        please review this page from time to time.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law and jurisdiction",
    content: () => (
      <>
        <p>
          These terms are governed by and construed in accordance with the laws of{" "}
          <strong>India</strong>. Subject to the grievance process below, the courts at{" "}
          <strong>{COMPANY.jurisdiction}</strong> shall have exclusive jurisdiction over any
          dispute arising out of or relating to the Platform or these terms.
        </p>
        <p>
          If any provision of these terms is held invalid or unenforceable, that provision
          shall be severed and the remaining provisions continue in full force. Our failure to
          enforce any right is not a waiver of it.
        </p>
      </>
    ),
  },
  {
    id: "grievance",
    title: "Grievance redressal and contact",
    content: () => (
      <>
        <p>
          For complaints about content on the Platform, a listing, an advisor's conduct, or
          any breach of these terms, contact our Grievance Officer, appointed under the
          Information Technology (Intermediary Guidelines and Digital Media Ethics Code)
          Rules, 2021 and the Consumer Protection (E-Commerce) Rules, 2020:
        </p>
        <LegalContact
          role="Grievance Officer"
          name={COMPANY.grievanceOfficer}
          email={COMPANY.grievanceEmail}
        />
        <p>
          For general enquiries, reach us at{" "}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <Title>Terms &amp; Conditions | {COMPANY.brand}</Title>
      <Meta
        name="description"
        content={`The terms governing your use of ${COMPANY.website} — our role as a property discovery platform, how listing and RERA information should be treated, enquiry consent, acceptable use and liability.`}
      />
      <Meta name="robots" content="index,follow" />
      <Link rel="canonical" href="/terms" />

      <LegalPage
        eyebrow="Legal & policy"
        heading="Terms &"
        headingAccent="conditions"
        intro={`We list projects and connect you with the people who build and sell them — we are not a party to your transaction. These terms set out what you can rely on from this Platform, what you must verify yourself, and the rules for using the site.`}
        sections={SECTIONS}
      />
    </>
  );
}
