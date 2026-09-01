/// <reference types="@solidjs/start/env" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /**
   * Google Ads conversion label for the enquiry conversion action
   * (Google Ads → Goals → Conversions → the action → Tag setup), e.g.
   * "AbC-D_efG-h12". Vite inlines this at BUILD time, so it must be set in the
   * deploy environment, not just locally. Absent → no conversion is sent.
   */
  readonly VITE_GADS_CONVERSION_LABEL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
