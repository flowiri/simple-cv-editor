export const STORAGE_KEY = "cv-builder-state-v2";

export const SECTION_TEMPLATES = [
  { key: "work-experience", label: "Work Experience",       shortLabel: "Work",           symbol: "W",  hint: "Company, role, responsibilities, technologies" },
  { key: "projects",        label: "Projects",              shortLabel: "Projects",       symbol: "J",  hint: "Project name, role, dates, description" },
  { key: "certificates",    label: "Certifications",        shortLabel: "Certifications", symbol: "Ce", hint: "Certification name, issue date, expiry date" },
  { key: "achievements",    label: "Achievements",          shortLabel: "Achievements",   symbol: "A",  hint: "Achievement with date" },
  { key: "publications",    label: "Academic Publications", shortLabel: "Publications",   symbol: "P",  hint: "Citation-style papers and research" },
  { key: "custom-section",  label: "Custom Section",        shortLabel: "Section",        symbol: "S",  hint: "Flexible entry list" },
  { key: "custom",          label: "Custom",                shortLabel: "Custom",         symbol: "X",  hint: "Freeform paragraph section" },
];

export const basicsFields = [
  ["fullName", "Full name"],
  ["headline", "Headline"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["nationality", "Nationality"],
  ["dateOfBirth", "Date of birth"],
  ["website", "Website"],
  ["linkedin", "LinkedIn"],
];
