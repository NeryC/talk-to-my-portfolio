import { load } from "cheerio";

export interface PublicCourse {
  slug: string;
  title: string;
  diplomaUrl: string;
  badgeImageUrl?: string;
}

export function extractPublicCourses(html: string, username: string): PublicCourse[] {
  const $ = load(html);
  const results: PublicCourse[] = [];
  const seen = new Set<string>();

  // Find every anchor that points to a diploma detail page for this user.
  $(`a[href*="/p/${username}/curso/"][href*="/diploma/detalle"]`).each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const slug = href.match(/\/curso\/([^/]+)\//)?.[1];
    if (!slug || seen.has(slug)) return;

    // Title: prefer data-title, else inner text trimmed.
    const title =
      $(el).attr("data-title") ??
      $(el).find("[data-title]").attr("data-title") ??
      $(el).find("span").first().text().trim() ??
      $(el).text().trim();

    if (!title) return;

    const badge = $(el).find("img").attr("src");

    seen.add(slug);
    results.push({
      slug,
      title,
      diplomaUrl: `https://platzi.com${href.endsWith("/") ? href : href + "/"}`,
      badgeImageUrl: badge ?? undefined,
    });
  });
  return results;
}
