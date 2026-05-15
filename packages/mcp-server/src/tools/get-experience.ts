import { z } from "zod";
import { loadExperience } from "@neryc/portfolio-shared";
import type { Tool } from "./types.js";

export const getExperienceInputSchema = z.object({});

export const getExperienceTool: Tool<typeof getExperienceInputSchema> = {
  name: "getExperience",
  description:
    "Return Nery's professional experience entries with metrics and stack. Use for 'where has he worked?' or 'show me his track record'.",
  inputSchema: getExperienceInputSchema,
  async execute() {
    return { experience: loadExperience() };
  },
};
