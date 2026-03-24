import { getSectionTemplates, SUPPORTED_CV_LANGUAGES } from "../utils/cvLanguage.js";

export const STORAGE_KEY = "cv-builder-state-v2";

export { getSectionTemplates, SUPPORTED_CV_LANGUAGES };

export const basicsFields = [
  ["fullName", "Full name"],
  ["headline", "Headline"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["gender", "Gender"],
  ["nationality", "Nationality"],
  ["dateOfBirth", "Date of birth"],
  ["website", "Website"],
  ["linkedin", "LinkedIn"],
];
