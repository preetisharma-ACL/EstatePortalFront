import type { RouteDefinition } from "@solidjs/router";
import TypeHub from "~/components/TypeHub";
import { TYPE_PAGES } from "~/lib/projectTypes";
import { cityTypeCountsQuery } from "~/lib/queries";

const TYPE = TYPE_PAGES.commercial;

export const route = {
  preload: () => {
    void cityTypeCountsQuery(TYPE.slug);
  },
} satisfies RouteDefinition;

export default function CommercialHub() {
  return <TypeHub type={TYPE} />;
}
