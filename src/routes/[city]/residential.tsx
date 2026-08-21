import type { RouteDefinition } from "@solidjs/router";
import CityTypeListing, { cityTypeFilters } from "~/components/CityTypeListing";
import { TYPE_PAGES } from "~/lib/projectTypes";
import { cityQuery, projectsQuery } from "~/lib/queries";

const TYPE = TYPE_PAGES.residential;

export const route = {
  preload: ({ params, location }) => {
    void cityQuery(params.city!);
    void projectsQuery(
      cityTypeFilters(params.city!, TYPE.slug, location.query as Record<string, string>),
    );
  },
} satisfies RouteDefinition;

export default function CityResidential() {
  return <CityTypeListing type={TYPE} />;
}
