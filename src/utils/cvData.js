export const createId = () => crypto.randomUUID();

export const createEntryItem = (overrides = {}) => ({
  id: createId(),
  title: "New entry",
  subtitle: "",
  meta: "",
  tags: "",
  citation: "",
  description: "",
  authors: "",
  venue: "",
  link: "",
  notes: "",
  customers: "",
  responsibilities: "",
  technologies: "",
  ...overrides,
});

export const createBulletItem = (text = "New bullet") => ({
  id: createId(),
  text,
  meta: "",
});

export const createPublicationItem = (overrides = {}) =>
  createEntryItem({
    title: "New publication",
    citation: "",
    authors: "",
    venue: "",
    link: "",
    notes: "",
    ...overrides,
  });

export const defaultItemForType = (type) =>
  type === "bullet-list" ? createBulletItem() : createEntryItem();

const normalizeKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const buildSectionKey = (section) =>
  normalizeKey(section?.sectionTemplate || section?.title || section?.type);

const buildItemKey = (section, item) => {
  const template = normalizeKey(section?.sectionTemplate || section?.type);

  if (template === "achievements" || section?.type === "bullet-list") {
    return normalizeKey(item?.text || item?.title || item?.description);
  }

  return normalizeKey(item?.title || item?.text || item?.description);
};

const mergeItemWithDefaults = (current, fallback) => ({
  ...fallback,
  ...current,
  id: current?.id || fallback?.id || createId(),
});

const mergeSectionWithDefaults = (current, fallback) => {
  const currentItems = Array.isArray(current?.items) ? current.items : [];
  const fallbackItems = Array.isArray(fallback?.items) ? fallback.items : [];
  const existingItemKeys = new Set(currentItems.map((item) => buildItemKey(current, item)).filter(Boolean));
  const mergedItems = [
    ...currentItems.map((item) => {
      const matchedFallback = fallbackItems.find(
        (candidate) => buildItemKey(current, candidate) === buildItemKey(current, item)
      );
      return matchedFallback ? mergeItemWithDefaults(item, matchedFallback) : item;
    }),
    ...fallbackItems.filter((item) => !existingItemKeys.has(buildItemKey(fallback, item))),
  ];

  return {
    ...fallback,
    ...current,
    id: current?.id || fallback?.id || createId(),
    items: mergedItems,
  };
};

export const createDefaultSections = () => [
    {
      id: createId(),
      sectionTemplate: "professional-summary",
      type: "bullet-list",
      title: "Professional Summary",
      content:
        "- 5+ years of experience in security engineering, vulnerability assessment, and secure delivery for web and cloud platforms.\n- Strong background in translating technical findings into practical remediation plans for product and engineering teams.\n- Comfortable combining hands-on testing, architecture review, and lightweight automation to improve security coverage.\n- Experience mentoring junior engineers and building reusable internal processes for recurring security work.\n- Clear communicator with a collaborative working style across engineering, product, and operations teams.",
      items: [],
    },
    {
      id: createId(),
      sectionTemplate: "education",
      type: "entry-list",
      title: "Education",
      items: [
        createEntryItem({
          title: "Northbridge Institute of Technology",
          subtitle: "M.Sc. in Cybersecurity",
          meta: "2022 - 2024",
          description:
            "Research focus: practical approaches for application security testing and cloud security monitoring.",
        }),
        createEntryItem({
          title: "Riverside University",
          subtitle: "B.Eng. in Software Engineering",
          meta: "2016 - 2020",
          description: "Graduated with distinction and completed a capstone project on secure application design.",
        }),
      ],
    },
    {
      id: createId(),
      sectionTemplate: "certificates",
      type: "entry-list",
      title: "Certificates",
      items: [
        createEntryItem({ title: "Certified Cloud Security Practitioner (CCSP)", meta: "2024" }),
        createEntryItem({ title: "AWS Certified Security - Specialty", meta: "2023" }),
        createEntryItem({ title: "GIAC Web Application Penetration Tester (GWAPT)", meta: "2022" }),
      ],
    },
    {
      id: createId(),
      sectionTemplate: "publications",
      type: "entry-list",
      title: "Publications",
      items: [
        createPublicationItem({
          title: "Practical Patterns for Security Review in Fast-Moving Product Teams",
          authors: "Alex Carter and Morgan Lee",
          venue:
            "Proceedings of the Applied Software Security Forum, Technical Practice Track",
          meta: "2024",
        }),
        createPublicationItem({
          title: "Improving Application Security Feedback Loops with Lightweight Automation",
          authors: "Alex Carter, Priya Shah, and Jordan Kim",
          venue:
            "Journal of Modern Engineering Practice, Vol. 12",
          link: "https://example.com/sample-publication",
          meta: "2023",
        }),
      ],
    },
    {
      id: createId(),
      sectionTemplate: "projects",
      type: "entry-list",
      title: "Outstanding Projects",
      items: [
        createEntryItem({
          title: "Customer Identity Platform Refresh",
          subtitle: "Lead Security Engineer",
          meta: "2024",
          tags: "",
          description:
            "Led security review activities for a high-traffic identity platform migration, covering threat modeling, API testing, and release-readiness guidance.",
        }),
        createEntryItem({
          title: "Cloud Security Baseline Program",
          subtitle: "Security Architect",
          meta: "2023",
          tags: "",
          description:
            "Built reusable infrastructure guardrails and review checklists to help product teams launch cloud workloads with stronger defaults.",
        }),
        createEntryItem({
          title: "Secure SDLC Toolkit",
          subtitle: "Application Security Engineer",
          meta: "2022",
          tags: "",
          description:
            "Created internal templates for security requirements, issue triage, and remediation tracking to shorten turnaround on recurring review work.",
        }),
      ],
    },
    {
      id: createId(),
      sectionTemplate: "achievements",
      type: "bullet-list",
      title: "Professional Achievements",
      items: [
        { ...createBulletItem("Designed and rolled out a reusable application security review checklist adopted by multiple product teams"), meta: "2024" },
        { ...createBulletItem("Reduced average remediation turnaround for critical findings by partnering with engineering on fix patterns and guidance"), meta: "2023" },
        { ...createBulletItem("Built internal automation to standardize evidence collection and reporting for recurring security assessments"), meta: "2022" },
      ],
    },
    {
      id: createId(),
      sectionTemplate: "work-experience",
      type: "entry-list",
      title: "Work Experience",
      items: [
        createEntryItem({
          title: "Northstar Digital",
          subtitle: "Senior Security Engineer",
          meta: "2023 - Present",
          tags: "Application and Cloud Security",
          customers: "Customer-facing platforms, internal services, and cloud infrastructure",
          responsibilities:
            "- Perform security reviews for web applications, internal APIs, and cloud-hosted services.\n- Partner with engineering teams to validate findings, prioritize fixes, and improve security design decisions.\n- Develop small internal tools and templates to reduce repeated manual steps in review workflows.\n- Support architecture discussions with concrete abuse cases and practical remediation options.",
          technologies:
            "Burp Suite, Semgrep, OWASP ZAP, AWS, Docker, Python, JavaScript",
        }),
        createEntryItem({
          title: "Summit Apps",
          subtitle: "Application Security Engineer",
          meta: "2021 - 2023",
          tags: "Secure Delivery",
          customers: "Product teams across SaaS, operations, and data platforms",
          responsibilities:
            "- Reviewed new services and feature releases for security risks before production rollout.\n- Performed source code review and manual validation for common application security weaknesses.\n- Helped establish remediation guidance and recurring security education for development teams.",
          technologies:
            "Snyk, GitHub Actions, Burp Suite, Postman, Node.js, TypeScript",
        }),
        createEntryItem({
          title: "Clearwater Systems",
          subtitle: "Security Analyst",
          meta: "2020 - 2021",
          tags: "Security Operations and Assessment",
          customers: "Internal applications and shared infrastructure",
          responsibilities:
            "- Supported recurring assessment work for business applications and internal infrastructure.\n- Documented findings, tracked remediation progress, and coordinated follow-up validation with service owners.",
          technologies:
            "Nessus, Nmap, Linux, PowerShell, Python",
        }),
      ],
    },
  ];

export const mergeWithDefaultSections = (sections = []) => {
  const defaults = createDefaultSections();
  const existing = Array.isArray(sections) ? sections : [];
  const existingKeys = new Set(existing.map(buildSectionKey).filter(Boolean));

  return [
    ...existing.map((section) => {
      const matchedDefault = defaults.find(
        (candidate) => buildSectionKey(candidate) === buildSectionKey(section)
      );
      return matchedDefault ? mergeSectionWithDefaults(section, matchedDefault) : section;
    }),
    ...defaults.filter((section) => !existingKeys.has(buildSectionKey(section))),
  ];
};

export const createSeedCv = () => ({
  id: createId(),
  name: "Alex Carter CV",
  basics: {
    fullName: "Alex Carter",
    headline: "Security Engineer",
    email: "alex.carter@example.com",
    phone: "+1 (555) 010-2048",
    nationality: "Canadian",
    dateOfBirth: "14/02/1994",
    website: "https://example.dev",
    linkedin: "https://www.linkedin.com/in/alex-carter-security",
    summary:
      "Security engineer with experience across application reviews, cloud security practices, and developer-facing remediation support. Focused on practical security improvements that fit real product delivery timelines.",
  },
  sections: createDefaultSections(),
});

export const createBlankCv = () => ({
  id: createId(),
  name: "Untitled CV",
  basics: {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    nationality: "",
    dateOfBirth: "",
    website: "",
    linkedin: "",
    summary: "",
  },
  sections: [],
});

export const applySeedDataToCv = (currentCv) => {
  const sample = createSeedCv();
  const base = currentCv && typeof currentCv === "object" ? currentCv : {};

  return {
    ...sample,
    id: base.id || sample.id,
    name:
      base.name && String(base.name).trim() && base.name !== "Untitled CV"
        ? base.name
        : sample.name,
  };
};
