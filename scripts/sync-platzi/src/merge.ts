import type { PublicCourse } from "./scrape-public-profile.js";
import type { CompletedCourseMeta } from "./scrape-learning-dashboard.js";

export interface MergedCourse {
  slug: string;
  title: string;
  diplomaUrl: string;
  badgeImageUrl?: string;
  completedAt: string | null;
  hours: number | null;
  // Skills must come from somewhere — see note below. For Phase 5, default empty.
  skills: string[];
}

export function mergeCourses(
  pub: PublicCourse[],
  priv: CompletedCourseMeta[],
  fallbackSkills: Record<string, string[]> = {},
): MergedCourse[] {
  const privBySlug = new Map(priv.map((p) => [p.slug, p]));
  const out: MergedCourse[] = [];
  const seen = new Set<string>();

  for (const p of pub) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    const meta = privBySlug.get(p.slug);
    out.push({
      slug: p.slug,
      title: p.title,
      diplomaUrl: p.diplomaUrl,
      badgeImageUrl: p.badgeImageUrl,
      completedAt: meta?.completedAt ?? null,
      hours: meta?.hours ?? null,
      skills: fallbackSkills[p.slug] ?? [],
    });
  }
  return out;
}
