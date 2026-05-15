import {
  loadProjects,
  loadProjectCaseStudy,
  loadCourses,
  loadCvMarkdown,
} from "@neryc/portfolio-shared";

export interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export async function listResources(): Promise<{ resources: Resource[] }> {
  const projects = loadProjects();
  const courses = loadCourses().courses;
  const resources: Resource[] = [
    {
      uri: "portfolio://cv/full",
      name: "Full CV (markdown)",
      description: "Nery's full CV",
      mimeType: "text/markdown",
    },
  ];
  for (const p of projects) {
    resources.push({
      uri: `portfolio://projects/${p.slug}/readme`,
      name: `${p.title} — README`,
      description: `README of ${p.title}`,
      mimeType: "text/markdown",
    });
    resources.push({
      uri: `portfolio://projects/${p.slug}/case-study`,
      name: `${p.title} — case study`,
      description: `Case study for ${p.title}`,
      mimeType: "text/markdown",
    });
  }
  for (const c of courses) {
    resources.push({
      uri: `portfolio://courses/${c.slug}/certificate`,
      name: `${c.title} — certificate`,
      description: `Course certificate for ${c.title}`,
      mimeType: "application/json",
    });
  }
  return { resources };
}

export async function readResource(
  uri: string
): Promise<{ uri: string; mimeType: string; text: string }> {
  if (uri === "portfolio://cv/full") {
    return { uri, mimeType: "text/markdown", text: loadCvMarkdown() };
  }
  const projectCaseStudy = uri.match(/^portfolio:\/\/projects\/([a-z0-9-]+)\/case-study$/);
  if (projectCaseStudy) {
    return { uri, mimeType: "text/markdown", text: loadProjectCaseStudy(projectCaseStudy[1]!) };
  }
  const projectReadme = uri.match(/^portfolio:\/\/projects\/([a-z0-9-]+)\/readme$/);
  if (projectReadme) {
    return { uri, mimeType: "text/markdown", text: loadProjectCaseStudy(projectReadme[1]!) };
  }
  const courseCert = uri.match(/^portfolio:\/\/courses\/([a-z0-9-]+)\/certificate$/);
  if (courseCert) {
    const c = loadCourses().courses.find((c) => c.slug === courseCert[1]);
    if (!c) throw new Error(`unknown course: ${courseCert[1]}`);
    return { uri, mimeType: "application/json", text: JSON.stringify(c, null, 2) };
  }
  throw new Error(`unknown resource URI: ${uri}`);
}
