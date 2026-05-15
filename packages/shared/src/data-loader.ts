import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { z } from "zod";
import { ProjectSummarySchema } from "./schemas/project.js";
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
export type ProjectListed = z.infer<typeof ProjectExtendedSchema>;

let _projects: ProjectListed[] | undefined;
let _experience: Experience[] | undefined;
let _skills: Skill[] | undefined;
let _cv: Cv | undefined;
let _cvMarkdown: string | undefined;
let _courses: CourseFile | undefined;

export function loadProjects(): ProjectListed[] {
  if (_projects) return _projects;
  const raw = readFileSync(join(DATA_DIR, "projects", "_index.json"), "utf-8");
  _projects = z.array(ProjectExtendedSchema).parse(JSON.parse(raw));
  return _projects;
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
  if (_experience) return _experience;
  const raw = readFileSync(join(DATA_DIR, "experience.json"), "utf-8");
  _experience = z.array(ExperienceSchema).parse(JSON.parse(raw));
  return _experience;
}

export function loadSkills(): Skill[] {
  if (_skills) return _skills;
  const raw = readFileSync(join(DATA_DIR, "skills.json"), "utf-8");
  _skills = z.array(SkillSchema).parse(JSON.parse(raw));
  return _skills;
}

export function loadCv(): Cv {
  if (_cv) return _cv;
  const raw = readFileSync(join(DATA_DIR, "cv.json"), "utf-8");
  _cv = CvSchema.parse(JSON.parse(raw));
  return _cv;
}

export function loadCvMarkdown(): string {
  if (_cvMarkdown !== undefined) return _cvMarkdown;
  _cvMarkdown = readFileSync(join(DATA_DIR, "cv.md"), "utf-8");
  return _cvMarkdown;
}

export function loadCourses(): CourseFile {
  if (_courses) return _courses;
  const raw = readFileSync(join(DATA_DIR, "courses.json"), "utf-8");
  _courses = CourseFileSchema.parse(JSON.parse(raw));
  return _courses;
}

/** Reset all loader caches. For tests only. */
export function __resetDataLoaderCache(): void {
  _projects = undefined;
  _experience = undefined;
  _skills = undefined;
  _cv = undefined;
  _cvMarkdown = undefined;
  _courses = undefined;
}
