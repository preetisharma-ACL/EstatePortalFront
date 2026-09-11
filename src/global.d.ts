/// <reference types="@solidjs/start/env" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /**
   * Google Ads conversion label for the *generic* enquiry conversion action
   * (Google Ads → Goals → Conversions → the action → Tag setup), e.g.
   * "AbC-D_efG-h12". Vite inlines this at BUILD time, so it must be set in the
   * deploy environment, not just locally.
   *
   * SUPERSEDED, and due for deletion. The backend now serves each project's
   * conversion action on the lead-create response, and that value always wins.
   * This is only the last resort in the legacy chain in src/lib/adsConversion.ts,
   * which exists solely because no project has a label in the admin yet. Once
   * the Ads team fills those in, this variable and LEGACY_LABELS both go.
   */
  readonly VITE_GADS_CONVERSION_LABEL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
