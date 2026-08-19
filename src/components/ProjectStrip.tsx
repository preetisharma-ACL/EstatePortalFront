import { For, Show } from "solid-js";
import type { ProjectListItem } from "~/lib/types";
import ProjectCard from "./ProjectCard";

/**
 * A titled row of project cards — a curated slice of a larger listing
 * ("closest to possession", "newly launched"), sitting above the full grid.
 *
 * Renders nothing at all until there is at least one project. These slices are
 * genuinely allowed to be empty — a township with no prelaunch inventory has no
 * "newly launched" section — so a skeleton would promise a section that then
 * vanishes. Appearing late is the lesser evil.
 */
export default function ProjectStrip(props: {
  eyebrow: string;
  title: string;
  description?: string;
  /** undefined while loading; an empty array hides the section. */
  projects: ProjectListItem[] | undefined;
  /** "tint" gives the warm band background, to alternate against a plain one. */
  tone?: "paper" | "tint";
  id?: string;
}) {
  const tint = () => props.tone === "tint";

  return (
    <Show when={props.projects?.length}>
      <section
        id={props.id}
        class="scroll-mt-20 py-14 sm:py-16"
        classList={{
          "border-y border-line bg-[#f8f5f2]": tint(),
          "bg-paper": !tint(),
        }}
      >
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="mx-auto max-w-2xl text-center">
            <p class="eyebrow">{props.eyebrow}</p>
            <h2 class="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
              {props.title}
            </h2>
            <div class="gold-rule mx-auto mt-4" />
            <Show when={props.description}>
              <p class="mt-4 text-slate">{props.description}</p>
            </Show>
          </div>

          <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <For each={props.projects}>{(p) => <ProjectCard project={p} />}</For>
          </div>
        </div>
      </section>
    </Show>
  );
}
