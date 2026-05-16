import { load } from "cheerio";

export interface CompletedCourseMeta {
  slug: string;
  completedAt: string | null;  // ISO 8601 or null if unparseable
  hours: number | null;
}

export function extractCompletedCourseMeta(html: string): CompletedCourseMeta[] {
  const $ = load(html);
  const results: CompletedCourseMeta[] = [];

  $("[data-slug]").each((_, el) => {
    const slug = $(el).attr("data-slug");
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return;

    const datetime = $(el).find("time").attr("datetime");
    const completedAt = datetime && !isNaN(Date.parse(datetime))
      ? new Date(datetime).toISOString()
      : null;

    const hoursText = $(el).find(".hours, [data-hours]").first().text();
    const hoursMatch = hoursText.match(/(\d+(?:\.\d+)?)/);
    const hours = hoursMatch ? Number(hoursMatch[1]) : null;

    results.push({ slug, completedAt, hours });
  });

  return results;
}
