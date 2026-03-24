import { createDefaultCvTheme, normalizeStoredCvTheme } from "./cvThemes.js";
import { DEFAULT_CV_LANGUAGE, SUPPORTED_CV_LANGUAGES, normalizeCvLanguage } from "./cvLanguage.js";

export const createId = () => crypto.randomUUID();
export const createEntryItem = (overrides = {}) => ({ id: createId(), title: "New entry", subtitle: "", meta: "", tags: "", citation: "", description: "", authors: "", venue: "", link: "", notes: "", customers: "", responsibilities: "", technologies: "", ...overrides });
export const createBulletItem = (text = "New bullet", overrides = {}) => ({ id: createId(), text, meta: "", ...overrides });
export const createPublicationItem = (overrides = {}) => createEntryItem({ title: "New publication", citation: "", authors: "", venue: "", link: "", notes: "", ...overrides });
export const defaultItemForType = (type) => (type === "bullet-list" ? createBulletItem() : createEntryItem());

const EMPTY_BASICS = { fullName: "", headline: "", email: "", phone: "", gender: "", nationality: "", dateOfBirth: "", website: "", linkedin: "", summary: "" };
const cloneItem = (item = {}) => ({ ...item, id: item.id || createId() });
const cloneSection = (section = {}) => ({ ...section, id: section.id || createId(), items: Array.isArray(section.items) ? section.items.map(cloneItem) : [] });
const cloneBasics = (basics = {}) => ({ ...EMPTY_BASICS, ...(basics && typeof basics === "object" ? basics : {}) });
const cloneSections = (sections = []) => (Array.isArray(sections) ? sections.map(cloneSection) : []);
const buildLocalizedContent = (basics = {}, sections = []) => ({ basics: cloneBasics(basics), sections: cloneSections(sections) });
const isBlankValue = (value) => Array.isArray(value) ? value.length === 0 : (value && typeof value === "object" ? false : String(value ?? "").trim() === "");
const normalizeKey = (value = "") => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
const buildSectionKey = (section) => normalizeKey(section?.sectionTemplate || section?.title || section?.type);
const buildItemKey = (section, item) => {
  const template = normalizeKey(section?.sectionTemplate || section?.type);
  return template === "achievements" || section?.type === "bullet-list"
    ? normalizeKey(item?.text || item?.title || item?.description)
    : normalizeKey(item?.title || item?.text || item?.description);
};

function mergeLocalizedBasics(currentBasics = {}, fallbackBasics = {}) {
  const nextBasics = cloneBasics(currentBasics);
  Object.entries(cloneBasics(fallbackBasics)).forEach(([key, value]) => {
    if (isBlankValue(nextBasics[key]) && !isBlankValue(value)) nextBasics[key] = value;
  });
  return nextBasics;
}

function mergeLocalizedItem(currentItem = {}, fallbackItem = {}) {
  const nextItem = { ...fallbackItem, ...currentItem, id: currentItem.id || fallbackItem.id || createId() };
  Object.entries(fallbackItem || {}).forEach(([key, value]) => {
    if (key !== "id" && isBlankValue(nextItem[key]) && !isBlankValue(value)) nextItem[key] = value;
  });
  return nextItem;
}

const findMatchingSection = (sections, section) => sections.find((candidate) => candidate.id === section.id || (String(candidate.sectionTemplate || "").trim().toLowerCase() && String(candidate.sectionTemplate || "").trim().toLowerCase() === String(section.sectionTemplate || "").trim().toLowerCase()));
const findMatchingItem = (items, item) => items.find((candidate) => candidate.id === item.id || (String(candidate.title || candidate.text || "").trim().toLowerCase() && String(candidate.title || candidate.text || "").trim().toLowerCase() === String(item.title || item.text || "").trim().toLowerCase()));

function mergeLocalizedSections(currentSections = [], fallbackSections = []) {
  const nextSections = cloneSections(currentSections).map((section) => {
    const fallbackSection = findMatchingSection(fallbackSections, section);
    if (!fallbackSection) return section;
    const mergedItems = section.items.map((item) => {
      const fallbackItem = findMatchingItem(fallbackSection.items || [], item);
      return fallbackItem ? mergeLocalizedItem(item, fallbackItem) : item;
    });
    const existingItemIds = new Set(mergedItems.map((item) => item.id));
    const appendedItems = (fallbackSection.items || []).filter((item) => !existingItemIds.has(item.id)).map(cloneItem);
    return { ...fallbackSection, ...section, id: section.id || fallbackSection.id || createId(), content: isBlankValue(section.content) && !isBlankValue(fallbackSection.content) ? fallbackSection.content : section.content, items: [...mergedItems, ...appendedItems] };
  });
  const existingSectionIds = new Set(nextSections.map((section) => section.id));
  const appendedSections = fallbackSections.filter((section) => !existingSectionIds.has(section.id)).map(cloneSection);
  return [...nextSections, ...appendedSections];
}

const mergeLocalizedContent = (currentContent = {}, fallbackContent = {}) => ({ basics: mergeLocalizedBasics(currentContent.basics, fallbackContent.basics), sections: mergeLocalizedSections(currentContent.sections, fallbackContent.sections) });

function createLocalizedBundleFromDocument(document = {}, language = DEFAULT_CV_LANGUAGE) {
  const normalizedLanguage = normalizeCvLanguage(language);
  const localized = {};
  SUPPORTED_CV_LANGUAGES.forEach(({ value }) => {
    const source = document.localized?.[value];
    localized[value] = source && typeof source === "object" ? buildLocalizedContent(source.basics, source.sections) : buildLocalizedContent(document.basics, document.sections);
  });
  if (!localized[normalizedLanguage]) localized[normalizedLanguage] = buildLocalizedContent(document.basics, document.sections);
  const englishFallback = localized.en || buildLocalizedContent(document.basics, document.sections);
  SUPPORTED_CV_LANGUAGES.forEach(({ value }) => { if (value !== "en") localized[value] = mergeLocalizedContent(localized[value], englishFallback); });
  return localized;
}

export function syncActiveCvLocale(inputCv) {
  const base = inputCv && typeof inputCv === "object" ? inputCv : {};
  const language = normalizeCvLanguage(base.language);
  const localized = createLocalizedBundleFromDocument(base, language);
  localized[language] = buildLocalizedContent(base.basics, base.sections);
  return { ...base, language, localized, basics: cloneBasics(localized[language].basics), sections: cloneSections(localized[language].sections) };
}

export function switchCvLanguage(inputCv, nextLanguage) {
  const current = syncActiveCvLocale(inputCv);
  const language = normalizeCvLanguage(nextLanguage);
  const nextContent = current.localized[language] || buildLocalizedContent(current.basics, current.sections);
  return { ...current, language, basics: cloneBasics(nextContent.basics), sections: cloneSections(nextContent.sections), localized: { ...current.localized, [language]: buildLocalizedContent(nextContent.basics, nextContent.sections) } };
}

const mergeItemWithDefaults = (current, fallback) => ({ ...fallback, ...current, id: current?.id || fallback?.id || createId() });
const mergeSectionWithDefaults = (current, fallback) => {
  const currentItems = Array.isArray(current?.items) ? current.items : [];
  const fallbackItems = Array.isArray(fallback?.items) ? fallback.items : [];
  const existingItemKeys = new Set(currentItems.map((item) => buildItemKey(current, item)).filter(Boolean));
  const mergedItems = [...currentItems.map((item) => {
    const matchedFallback = fallbackItems.find((candidate) => buildItemKey(current, candidate) === buildItemKey(current, item));
    return matchedFallback ? mergeItemWithDefaults(item, matchedFallback) : item;
  }), ...fallbackItems.filter((item) => !existingItemKeys.has(buildItemKey(fallback, item)))];
  return { ...fallback, ...current, id: current?.id || fallback?.id || createId(), items: mergedItems };
};

function createThangSectionIds() {
  return { professionalSummary: createId(), education: createId(), certificates: createId(), publications: createId(), projects: createId(), achievements: createId(), workExperience: createId(), educationVnu: createId(), educationFpt: createId(), certificateOscp: createId(), certificateAws: createId(), certificateOswe: createId(), publicationAdaptiveFederated: createId(), publicationCovidAgent: createId(), publicationSecuredDistributed: createId(), projectBugBounty: createId(), projectViolympic: createId(), projectTpBank: createId(), achievementHtb: createId(), achievementNab2025: createId(), achievementNab2024: createId(), achievementAsean: createId(), workNab: createId(), workFsoft: createId(), workFis: createId() };
}

function createSeedSectionsByLanguage(ids) {
  const publications = [
    createPublicationItem({ id: ids.publicationAdaptiveFederated, title: "Adaptive Federated Learning for Software Vulnerability Detection.", authors: "Thang Phung Duc, and Dai Tho Nguyen", venue: "Proceedings of the 14th International Symposium on Information and Communication Technology (SoICT 2025), Nhatrang, Vietnam, 12-14, Springer Communications in Computer and Information Science (CCIS) Series", meta: "December, 2025" }),
    createPublicationItem({ id: ids.publicationCovidAgent, title: "FU Covid-19 AI Agent built on Attention algorithm using a combination of Transformer, ALBERT model, and RASA framework", authors: "Ban Quy Tran, Thai Van Nguyen, Thang Duc Phung, Viet Tan Nguyen, Dat Duy Tran, and Son Tung Ngo", venue: "In Proceedings of the 10th International Conference on Software and Computer Applications (ICSCA '21). Association for Computing Machinery, New York, NY, USA, 22-31", link: "https://doi.org/10.1145/3457784.3457788", meta: "2021" }),
    createPublicationItem({ id: ids.publicationSecuredDistributed, title: "Design and Implementation a Secured and Distributed System using CBC, Socket, and RMI Technologies", authors: "Thang Duc Phung, Thai Van Nguyen, and Ban Quy Tran", venue: "In Proceedings of the 10th International Conference on Software and Computer Applications (ICSCA '21). Association for Computing Machinery, New York, NY, USA, 238-243", link: "https://doi.org/10.1145/3457784.3457830", meta: "2021" }),
  ];
  return {
    en: [
      { id: ids.professionalSummary, sectionTemplate: "professional-summary", type: "bullet-list", title: "Professional Summary", content: "- 4+ years of experience with application security assessment and penetration testing including web, mobile applications, infrastructure, network segments and cloud platforms (AWS, Azure).\n- Supporting the development team to adjust security issues severity and resolve reported security issues in the most proper way.\n- Experience in using a variety of vulnerability scanners and manual penetration testing tools.\n- Experience with security training, mentoring for freshers.\n- Team-player and professional working behavior with ability to work independently.\n- Willing to learn new technologies and processes, improve professional skills and adapt to new environments.", items: [] },
      { id: ids.education, sectionTemplate: "education", type: "entry-list", title: "Education", items: [
        createEntryItem({ id: ids.educationVnu, title: "Vietnam National University - University of Engineering and Technology", subtitle: "Major: Information Assurance", meta: "2023 - present", description: "Thesis: Vulnerability detection using adaptive federated learning\nSupervisor: PhD. Dai Tho Nguyen\n(expected to defend in 05/2026)" }),
        createEntryItem({ id: ids.educationFpt, title: "FPT University", subtitle: "Major: Information Assurance", meta: "2018 - 2022", description: "Graduate as Valedictorian of the Engineering sector (GPA: 9.1/10)" }),
      ]},
      { id: ids.certificates, sectionTemplate: "certificates", type: "entry-list", title: "Certificates", items: [createEntryItem({ id: ids.certificateOscp, title: "OffSec Certified Professional (OSCP)", meta: "07/2024" }), createEntryItem({ id: ids.certificateAws, title: "AWS Certified Solutions Architect - Associate", meta: "02/2024" }), createEntryItem({ id: ids.certificateOswe, title: "OffSec Web Expert (OSWE)", meta: "04/2023" })] },
      { id: ids.publications, sectionTemplate: "publications", type: "entry-list", title: "Publications", items: publications },
      { id: ids.projects, sectionTemplate: "projects", type: "entry-list", title: "Outstanding Projects", items: [
        createEntryItem({ id: ids.projectBugBounty, title: "FPT Internal BugBounty", subtitle: "Bug Hunter", meta: "2023", description: "Performed bug hunting on internet-facing web and application assets of FPT Corporation, uncovering critical vulnerabilities including SQL Injection and Privilege Escalation" }),
        createEntryItem({ id: ids.projectViolympic, title: "Website violympic.vn", subtitle: "Team Leader, Security Engineer", meta: "2023", description: "Discovered critical business logic vulnerabilities that enable online participants (students) to manipulate the exam system and achieve inflated scores (potentially 100) without actual learning" }),
        createEntryItem({ id: ids.projectTpBank, title: "TPBank", subtitle: "Penetration Tester", meta: "2021", description: "Conducted security assessments across multiple banking web applications (both internal and external), identifying critical vulnerabilities such as SQL Injection and Command Injection" }),
      ]},
      { id: ids.achievements, sectionTemplate: "achievements", type: "bullet-list", title: "Professional Achievements", items: [
        createBulletItem("Rank 53rd out of 551 teams in Hack The Box Business: Global Cyber Skills Benchmark CTF 2025", { id: ids.achievementHtb, meta: "05/2025" }),
        createBulletItem("First prize in an NAB Technical Hack The Box Challenge - Capture The Flag competition of Cyber Month event", { id: ids.achievementNab2025, meta: "10/2025" }),
        createBulletItem("First prize in an NAB Technical Hack The Box Challenge - Capture The Flag competition of Cyber Month event", { id: ids.achievementNab2024, meta: "10/2024" }),
        createBulletItem("Third prize in preliminary round of ASEAN Student Contest on Information Security", { id: ids.achievementAsean, meta: "10/2021" }),
      ]},
      { id: ids.workExperience, sectionTemplate: "work-experience", type: "entry-list", title: "Work Experience", items: [
        createEntryItem({ id: ids.workNab, title: "National Australia Bank", subtitle: "Analyst, Penetration Testing", meta: "07/2023 - Present", tags: "Offensive Security", customers: "Internal and external banking services of National Australia Bank", responsibilities: "- Perform vulnerability assessments and penetration tests for web applications, mobile applications, infrastructure, cloud platforms (AWS, Azure), and public resources.\n- Perform source code review to identify security vulnerabilities.\n- Support architecture reviews to define abuse cases and highlight security gaps, especially around authorization and business logic.\n- Conduct security research and share findings to broaden the team's test coverage.\n- Develop internal tools to help automate security processes within the team.\n- Support incident response by validating and exploiting reported vulnerabilities.\n- Report discovered issues and advise developers on effective remediation approaches.", technologies: "Qualys, Nessus, NetSparker, Burp Suite, Nmap, sqlmap, MOBSF, Frida, Bytecode Viewer, Java, Python, PHP, AWS, Azure" }),
        createEntryItem({ id: ids.workFsoft, title: "FPT Software", subtitle: "Penetration Testing, Application Security Engineer", meta: "06/2022 - 06/2023", tags: "Security Assurance Services", customers: "Global customers across healthcare, finance, automotive, e-commerce, retail, and other domains", responsibilities: "- Perform vulnerability assessments and penetration tests for web and mobile applications.\n- Perform source code review to identify security vulnerabilities.\n- Mentor and support fresher team members so they can work independently.\n- Conduct security research and report results to broaden the team's test coverage.\n- Report discovered issues and consult with developers on remediation.", technologies: "Accunetix, HCL AppScan, Nessus, Burp Suite, Nmap, sqlmap, MOBSF, Frida, Bytecode Viewer, Java, Python, PHP" }),
        createEntryItem({ id: ids.workFis, title: "FPT Information System", subtitle: "Penetration Testing, Vulnerability Assessment", meta: "01/2021 - 05/2022", tags: "Cybersecurity Service Division", customers: "Domestic customers across banking, finance, public services, and other domains", responsibilities: "- Perform vulnerability assessments and penetration tests for web and mobile applications.\n- Perform source code review to identify security vulnerabilities.\n- Report discovered issues and consult with developers on remediation.", technologies: "Accunetix, HCL AppScan, Nessus, Burp Suite, Nmap, sqlmap, MOBSF, Frida, Bytecode Viewer, Java, Python, PHP" }),
      ]},
    ],
    vi: [
      { id: ids.professionalSummary, sectionTemplate: "professional-summary", type: "bullet-list", title: "Tóm Tắt Chuyên Môn", content: "- Hơn 4 năm kinh nghiệm trong đánh giá an toàn ứng dụng và kiểm thử xâm nhập bao gồm ứng dụng web, ứng dụng di động, hạ tầng, các phân đoạn mạng và nền tảng đám mây (AWS, Azure).\n- Hỗ trợ đội phát triển điều chỉnh mức độ nghiêm trọng của các vấn đề bảo mật và xử lý các lỗi được báo cáo theo cách phù hợp nhất.\n- Có kinh nghiệm sử dụng nhiều công cụ quét lỗ hổng và công cụ kiểm thử xâm nhập thủ công.\n- Có kinh nghiệm đào tạo bảo mật và hướng dẫn các bạn fresher.\n- Có tinh thần đồng đội, tác phong làm việc chuyên nghiệp và khả năng làm việc độc lập.\n- Sẵn sàng học hỏi công nghệ, quy trình mới, nâng cao kỹ năng chuyên môn và thích nghi với môi trường mới.", items: [] },
      { id: ids.education, sectionTemplate: "education", type: "entry-list", title: "Học Vấn", items: [
        createEntryItem({ id: ids.educationVnu, title: "Đại học Quốc gia Hà Nội - Trường Đại học Công nghệ", subtitle: "Chuyên ngành: An toàn thông tin", meta: "2023 - hiện tại", description: "Luận văn: Phát hiện lỗ hổng phần mềm sử dụng học liên kết thích nghi\nGiảng viên hướng dẫn: TS. Nguyễn Đại Thọ\n(dự kiến bảo vệ vào 05/2026)" }),
        createEntryItem({ id: ids.educationFpt, title: "Đại học FPT", subtitle: "Chuyên ngành: An toàn thông tin", meta: "2018 - 2022", description: "Tốt nghiệp Thủ khoa khối ngành Kỹ thuật (GPA: 9.1/10)" }),
      ]},
      { id: ids.certificates, sectionTemplate: "certificates", type: "entry-list", title: "Chứng Chỉ", items: [createEntryItem({ id: ids.certificateOscp, title: "OffSec Certified Professional (OSCP)", meta: "07/2024" }), createEntryItem({ id: ids.certificateAws, title: "AWS Certified Solutions Architect - Associate", meta: "02/2024" }), createEntryItem({ id: ids.certificateOswe, title: "OffSec Web Expert (OSWE)", meta: "04/2023" })] },
      { id: ids.publications, sectionTemplate: "publications", type: "entry-list", title: "Công Trình Công Bố", items: publications.map(cloneItem) },
      { id: ids.projects, sectionTemplate: "projects", type: "entry-list", title: "Dự Án Nổi Bật", items: [
        createEntryItem({ id: ids.projectBugBounty, title: "FPT Internal BugBounty", subtitle: "Bug Hunter", meta: "2023", description: "Thực hiện săn lùng lỗi trên các tài sản web và ứng dụng công khai trên Internet của Tập đoàn FPT, phát hiện các lỗ hổng nghiêm trọng như SQL Injection và Privilege Escalation" }),
        createEntryItem({ id: ids.projectViolympic, title: "Website violympic.vn", subtitle: "Team Leader, Security Engineer", meta: "2023", description: "Phát hiện các lỗ hổng logic nghiệp vụ nghiêm trọng cho phép người tham gia trực tuyến (học sinh) thao túng hệ thống thi và đạt điểm số cao bất thường (có thể đạt 100) mà không cần học thực sự" }),
        createEntryItem({ id: ids.projectTpBank, title: "TPBank", subtitle: "Penetration Tester", meta: "2021", description: "Thực hiện đánh giá an toàn cho nhiều ứng dụng web ngân hàng (cả nội bộ và bên ngoài), xác định các lỗ hổng nghiêm trọng như SQL Injection và Command Injection" }),
      ]},
      { id: ids.achievements, sectionTemplate: "achievements", type: "bullet-list", title: "Thành Tích Nổi Bật", items: [
        createBulletItem("Xếp hạng 53/551 đội tại Hack The Box Business: Global Cyber Skills Benchmark CTF 2025", { id: ids.achievementHtb, meta: "05/2025" }),
        createBulletItem("Giải Nhất NAB Technical Hack The Box Challenge - Capture The Flag trong sự kiện Cyber Month", { id: ids.achievementNab2025, meta: "10/2025" }),
        createBulletItem("Giải Nhất NAB Technical Hack The Box Challenge - Capture The Flag trong sự kiện Cyber Month", { id: ids.achievementNab2024, meta: "10/2024" }),
        createBulletItem("Giải Ba vòng sơ loại cuộc thi Sinh viên với An toàn thông tin ASEAN", { id: ids.achievementAsean, meta: "10/2021" }),
      ]},
      { id: ids.workExperience, sectionTemplate: "work-experience", type: "entry-list", title: "Kinh Nghiệm Làm Việc", items: [
        createEntryItem({ id: ids.workNab, title: "National Australia Bank", subtitle: "Chuyên viên Kiểm thử xâm nhập", meta: "07/2023 - Hiện tại", tags: "Offensive Security", customers: "Các dịch vụ ngân hàng nội bộ và bên ngoài của National Australia Bank", responsibilities: "- Thực hiện đánh giá lỗ hổng và kiểm thử xâm nhập cho ứng dụng web, ứng dụng di động, hạ tầng, nền tảng đám mây (AWS, Azure) và tài nguyên công khai.\n- Thực hiện rà soát mã nguồn để phát hiện lỗ hổng bảo mật.\n- Hỗ trợ đánh giá kiến trúc để xây dựng abuse case và chỉ ra các khoảng trống bảo mật, đặc biệt quanh vấn đề phân quyền và logic nghiệp vụ.\n- Nghiên cứu bảo mật và chia sẻ kết quả để mở rộng bộ test case cho cả đội.\n- Phát triển công cụ nội bộ giúp tự động hóa quy trình bảo mật trong đội.\n- Hỗ trợ ứng phó sự cố bằng cách xác minh và khai thác các lỗ hổng được báo cáo.\n- Báo cáo lỗi đã phát hiện và tư vấn cho lập trình viên cách khắc phục hiệu quả.", technologies: "Qualys, Nessus, NetSparker, Burp Suite, Nmap, sqlmap, MOBSF, Frida, Bytecode Viewer, Java, Python, PHP, AWS, Azure" }),
        createEntryItem({ id: ids.workFsoft, title: "FPT Software", subtitle: "Kiểm thử xâm nhập, Kỹ sư An toàn ứng dụng", meta: "06/2022 - 06/2023", tags: "Security Assurance Services", customers: "Khách hàng toàn cầu thuộc nhiều lĩnh vực như y tế, tài chính, ô tô, thương mại điện tử, bán lẻ và các lĩnh vực khác", responsibilities: "- Thực hiện đánh giá lỗ hổng và kiểm thử xâm nhập cho ứng dụng web và di động.\n- Thực hiện rà soát mã nguồn để phát hiện lỗ hổng bảo mật.\n- Hướng dẫn và hỗ trợ nhân sự mới để có thể làm việc độc lập.\n- Nghiên cứu bảo mật và báo cáo kết quả để mở rộng bộ test case cho đội.\n- Báo cáo lỗi đã phát hiện và tư vấn cho lập trình viên cách khắc phục.", technologies: "Accunetix, HCL AppScan, Nessus, Burp Suite, Nmap, sqlmap, MOBSF, Frida, Bytecode Viewer, Java, Python, PHP" }),
        createEntryItem({ id: ids.workFis, title: "FPT Information System", subtitle: "Kiểm thử xâm nhập, Đánh giá lỗ hổng", meta: "01/2021 - 05/2022", tags: "Cybersecurity Service Division", customers: "Khách hàng trong nước thuộc nhiều lĩnh vực như ngân hàng, tài chính, dịch vụ công và các lĩnh vực khác", responsibilities: "- Thực hiện đánh giá lỗ hổng và kiểm thử xâm nhập cho ứng dụng web và di động.\n- Thực hiện rà soát mã nguồn để phát hiện lỗ hổng bảo mật.\n- Báo cáo lỗi đã phát hiện và tư vấn cho lập trình viên cách khắc phục.", technologies: "Accunetix, HCL AppScan, Nessus, Burp Suite, Nmap, sqlmap, MOBSF, Frida, Bytecode Viewer, Java, Python, PHP" }),
      ]},
    ],
  };
}

function createSeedLocalizedContent() {
  const ids = createThangSectionIds();
  const sections = createSeedSectionsByLanguage(ids);
  return {
    en: { basics: { fullName: "Phung Duc Thang", headline: "Penetration Tester", email: "thangpd2305.work@gmail.com", phone: "(+84) 366198046", gender: "Male", nationality: "Vietnam", dateOfBirth: "31/10/2000", website: "https://flowiri.hashnode.dev/", linkedin: "https://www.linkedin.com/in/phung-duc-thang-34b9512b5/", summary: "Pursuing a professional penetration tester and security researcher career path in a healthy and positively pressing environment, so that I can continuously improve my technical skillset and expertise knowledge in securing critical applications and infrastructures of targeted customers." }, sections: sections.en },
    vi: { basics: { fullName: "Phùng Đức Thắng", headline: "Chuyên viên Kiểm thử xâm nhập", email: "thangpd2305.work@gmail.com", phone: "(+84) 366198046", gender: "Nam", nationality: "Việt Nam", dateOfBirth: "31/10/2000", website: "https://flowiri.hashnode.dev/", linkedin: "https://www.linkedin.com/in/phung-duc-thang-34b9512b5/", summary: "Theo đuổi con đường sự nghiệp chuyên nghiệp trong lĩnh vực kiểm thử xâm nhập và nghiên cứu an ninh mạng trong một môi trường lành mạnh, nhiều áp lực tích cực, để tôi có thể liên tục nâng cao bộ kỹ năng kỹ thuật và kiến thức chuyên sâu trong việc bảo vệ các ứng dụng và hạ tầng quan trọng của khách hàng mục tiêu." }, sections: sections.vi },
  };
}

export const createDefaultSections = (language = DEFAULT_CV_LANGUAGE) => {
  const seed = createSeedLocalizedContent();
  return cloneSections(seed[normalizeCvLanguage(language)].sections);
};

export const mergeWithDefaultSections = (sections = [], language = DEFAULT_CV_LANGUAGE) => {
  const defaults = createDefaultSections(language);
  const existing = Array.isArray(sections) ? sections : [];
  const existingKeys = new Set(existing.map(buildSectionKey).filter(Boolean));
  return [...existing.map((section) => {
    const matchedDefault = defaults.find((candidate) => buildSectionKey(candidate) === buildSectionKey(section));
    return matchedDefault ? mergeSectionWithDefaults(section, matchedDefault) : section;
  }), ...defaults.filter((section) => !existingKeys.has(buildSectionKey(section)))];
};

export const createSeedCv = (language = DEFAULT_CV_LANGUAGE) => {
  const activeLanguage = normalizeCvLanguage(language);
  const localized = createSeedLocalizedContent();
  return syncActiveCvLocale({ id: createId(), language: activeLanguage, name: "Phung Duc Thang CV", theme: createDefaultCvTheme(), basics: localized[activeLanguage].basics, sections: localized[activeLanguage].sections, localized });
};

export const createBlankCv = (language = DEFAULT_CV_LANGUAGE) => {
  const activeLanguage = normalizeCvLanguage(language);
  const blankLocalized = Object.fromEntries(SUPPORTED_CV_LANGUAGES.map(({ value }) => [value, buildLocalizedContent(EMPTY_BASICS, [])]));
  return syncActiveCvLocale({ id: createId(), language: activeLanguage, name: "Untitled CV", theme: createDefaultCvTheme(), basics: EMPTY_BASICS, sections: [], localized: blankLocalized });
};

export const applySeedDataToCv = (currentCv) => {
  const base = syncActiveCvLocale(currentCv || {});
  const sample = createSeedCv(base.language);
  return syncActiveCvLocale({ ...sample, id: base.id || sample.id, name: base.name && String(base.name).trim() && base.name !== "Untitled CV" ? base.name : sample.name, theme: normalizeStoredCvTheme(base.theme || sample.theme), language: base.language || sample.language });
};
