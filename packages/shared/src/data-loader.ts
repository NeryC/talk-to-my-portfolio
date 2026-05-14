import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { z } from "zod";
import { ProjectSummarySchema, type ProjectSummary } from "./schemas/project.js";
import { ExperienceSchema, type Experience } from "./schemas/experience.js";
import { SkillSchema, type Skill } from "./schemas/skill.js";
import { CvSchema, type Cv } from "./schemas/cv.js";
import { CourseFileSchema, type CourseFile } from "./schemas/course.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

const ProjectExtendedSchema = ProjectSummarySchema.extend({
  stack: z.array(z.string()),
  highlights: z.array(z.string()),
});

export function loadProjects(): ProjectSummary[] {
  const raw = readFileSync(join(DATA_DIR, "projects", "_index.json"), "utf-8");
  const parsed = JSON.parse(raw);
  return z.array(ProjectExtendedSchema).parse(parsed);
}

export function loadProjectCaseStudy(slug: string): string {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`invalid slug: ${slug}`);
  }
  try {
    return readFileSync(join(DATA_DIR, "projects", `${slug}.md`), "utf-8");
  } catch {
    throw new Error(`unknown project slug: ${slug}`);
  }
}

export function loadExperience(): Experience[] {
  const raw = readFileSync(join(DATA_DIR, "experience.json"), "utf-8");
  return z.array(ExperienceSchema).parse(JSON.parse(raw));
}

export function loadSkills(): Skill[] {
  const raw = readFileSync(join(DATA_DIR, "skills.json"), "utf-8");
  return z.array(SkillSchema).parse(JSON.parse(raw));
}

export function loadCv(): Cv {
  const raw = readFileSync(join(DATA_DIR, "cv.json"), "utf-8");
  return CvSchema.parse(JSON.parse(raw));
}

export function loadCvMarkdown(): string {
  return readFileSync(join(DATA_DIR, "cv.md"), "utf-8");
}

export function loadCourses(): CourseFile {
  const raw = readFileSync(join(DATA_DIR, "courses.json"), "utf-8");
  return CourseFileSchema.parse(JSON.parse(raw));
}
