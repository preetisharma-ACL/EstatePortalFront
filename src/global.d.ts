/// <reference types="@solidjs/start/env" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /**
   * Google Ads conversion label for the *generic* enquiry conversion action
   * (Google Ads → Goals → Conversions → the action → Tag setup), e.g.
   * "AbC-D_efG-h12". Vite inlines this at BUILD time, so it must be set in the
   * deploy environment, not just locally.
   *
   * The fallback only: projects with their own conversion action are listed in
   * src/lib/adsConversion.ts and never consult this. Absent → those projects
   * still convert, every other campaign project sends nothing.
   */
  readonly VITE_GADS_CONVERSION_LABEL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
