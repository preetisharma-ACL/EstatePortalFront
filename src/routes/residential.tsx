import type { RouteDefinition } from "@solidjs/router";
import TypeHub from "~/components/TypeHub";
import { TYPE_PAGES } from "~/lib/projectTypes";
import { cityTypeCountsQuery } from "~/lib/queries";

const TYPE = TYPE_PAGES.residential;

export const route = {
  preload: () => {
    void cityTypeCountsQuery(TYPE.slug);
  },
} satisfies RouteDefinition;

export default function ResidentialHub() {
  return <TypeHub type={TYPE} />;
}
