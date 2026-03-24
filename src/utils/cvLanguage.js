export const DEFAULT_CV_LANGUAGE = "en";

export const SUPPORTED_CV_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
];

const SECTION_TEMPLATE_CONTENT = {
  en: {
    "work-experience": {
      label: "Work Experience",
      shortLabel: "Work",
      symbol: "W",
      hint: "Company, role, responsibilities, technologies",
      title: "Work Experience",
    },
    projects: {
      label: "Projects",
      shortLabel: "Projects",
      symbol: "J",
      hint: "Project name, role, dates, description",
      title: "Projects",
    },
    certificates: {
      label: "Certifications",
      shortLabel: "Certifications",
      symbol: "Ce",
      hint: "Certification name, issue date, expiry date",
      title: "Certifications",
    },
    achievements: {
      label: "Achievements",
      shortLabel: "Achievements",
      symbol: "A",
      hint: "Achievement with date",
      title: "Achievements",
    },
    publications: {
      label: "Academic Publications",
      shortLabel: "Publications",
      symbol: "P",
      hint: "Citation-style papers and research",
      title: "Academic Publications",
    },
    "custom-section": {
      label: "Custom Section",
      shortLabel: "Section",
      symbol: "S",
      hint: "Flexible entry list",
      title: "Custom Section",
    },
    custom: {
      label: "Custom",
      shortLabel: "Custom",
      symbol: "X",
      hint: "Freeform paragraph section",
      title: "Custom",
    },
  },
  vi: {
    "work-experience": {
      label: "Kinh Nghiệm Làm Việc",
      shortLabel: "Kinh Nghiệm",
      symbol: "W",
      hint: "Công ty, vai trò, trách nhiệm, công nghệ",
      title: "Kinh Nghiệm Làm Việc",
    },
    projects: {
      label: "Dự Án",
      shortLabel: "Dự Án",
      symbol: "J",
      hint: "Tên dự án, vai trò, thời gian, mô tả",
      title: "Dự Án",
    },
    certificates: {
      label: "Chứng Chỉ",
      shortLabel: "Chứng Chỉ",
      symbol: "Ce",
      hint: "Tên chứng chỉ, ngày cấp, ngày hết hạn",
      title: "Chứng Chỉ",
    },
    achievements: {
      label: "Thành Tích",
      shortLabel: "Thành Tích",
      symbol: "A",
      hint: "Thành tích và mốc thời gian",
      title: "Thành Tích",
    },
    publications: {
      label: "Công Trình Công Bố",
      shortLabel: "Công Bố",
      symbol: "P",
      hint: "Bài báo, nghiên cứu theo định dạng trích dẫn",
      title: "Công Trình Công Bố",
    },
    "custom-section": {
      label: "Mục Tùy Chỉnh",
      shortLabel: "Mục",
      symbol: "S",
      hint: "Danh sách mục linh hoạt",
      title: "Mục Tùy Chỉnh",
    },
    custom: {
      label: "Tùy Chỉnh",
      shortLabel: "Tùy Chỉnh",
      symbol: "X",
      hint: "Đoạn văn tự do",
      title: "Tùy Chỉnh",
    },
  },
};

const CV_LANGUAGE_COPY = {
  en: {
    objective: "Objective",
    contact: {
      email: "Email",
      phone: "Phone",
      website: "Website",
      linkedin: "LinkedIn",
      nationality: "Nationality",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
    },
    work: {
      customers: "Customers",
      responsibilities: "Responsibilities",
    },
  },
  vi: {
    objective: "Mục Tiêu Nghề Nghiệp",
    contact: {
      email: "Email",
      phone: "Điện thoại",
      website: "Website",
      linkedin: "LinkedIn",
      nationality: "Quốc tịch",
      dateOfBirth: "Ngày sinh",
      gender: "Giới tính",
    },
    work: {
      customers: "Khách hàng",
      responsibilities: "Trách nhiệm",
    },
  },
};

export function normalizeCvLanguage(language) {
  return SUPPORTED_CV_LANGUAGES.some((option) => option.value === language)
    ? language
    : DEFAULT_CV_LANGUAGE;
}

export function getCvLanguageCopy(language) {
  return CV_LANGUAGE_COPY[normalizeCvLanguage(language)];
}

export function getSectionTemplateDefinition(templateKey, language = DEFAULT_CV_LANGUAGE) {
  const normalizedLanguage = normalizeCvLanguage(language);
  return (
    SECTION_TEMPLATE_CONTENT[normalizedLanguage][templateKey]
    || SECTION_TEMPLATE_CONTENT[DEFAULT_CV_LANGUAGE][templateKey]
    || SECTION_TEMPLATE_CONTENT[DEFAULT_CV_LANGUAGE].custom
  );
}

export function getSectionTemplates(language = DEFAULT_CV_LANGUAGE) {
  return Object.entries(SECTION_TEMPLATE_CONTENT[normalizeCvLanguage(language)]).map(
    ([key, definition]) => ({
      key,
      ...definition,
    })
  );
}
