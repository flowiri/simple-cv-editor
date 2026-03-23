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

export const createSeedCv = () => ({
  id: createId(),
  name: "Phung Duc Thang CV",
  basics: {
    fullName: "Phung Duc Thang",
    headline: "Penetration Tester",
    email: "thangpd2305.work@gmail.com",
    phone: "(+84) 366198046",
    nationality: "Vietnam",
    dateOfBirth: "31/10/2000",
    gender: "Male",
    website: "https://flowiri.hashnode.dev/",
    linkedin: "https://www.linkedin.com/in/phung-duc-thang-34b9512b5/",
    summary:
      "Pursuing a professional penetration tester and security researcher career path in a healthy and positively pressing environment, so that I can continuously improve my technical skillset and expertise knowledge in securing critical applications and infrastructures of targeted customers.",
  },
  sections: [
    {
      id: createId(),
      sectionTemplate: "professional-summary",
      type: "bullet-list",
      title: "Professional Summary",
      content:
        "- 4+ years of experience with application security assessment and penetration testing including web, mobile applications, infrastructure, network segments and cloud platforms (AWS, Azure).\n- Supporting the development team to adjust security issues severity and resolve reported security issues in the most proper way.\n- Experience in using a variety of vulnerability scanners and manual penetration testing tools.\n- Experience with security training, mentoring for freshers.\n- Team-player and professional working behavior with ability to work independently.\n- Willing to learn new technologies and processes, improve professional skills and adapt to new environments.",
      items: [],
    },
    {
      id: createId(),
      sectionTemplate: "education",
      type: "entry-list",
      title: "Education",
      items: [
        createEntryItem({
          title: "FPT University",
          subtitle: "Major: Information Assurance",
          meta: "2018 - 2022",
          description: "Graduate as Valedictorian of the Engineering sector (GPA: 9.1/10)",
        }),
      ],
    },
    {
      id: createId(),
      sectionTemplate: "certificates",
      type: "entry-list",
      title: "Certificates",
      items: [
        createEntryItem({ title: "OffSec Certified Professional (OSCP)", meta: "07/2024" }),
        createEntryItem({ title: "AWS Certified Solution Architect - Associate", meta: "02/2024" }),
        createEntryItem({ title: "OffSec Web Expert (OSWE)", meta: "04/2023" }),
      ],
    },
    {
      id: createId(),
      sectionTemplate: "achievements",
      type: "bullet-list",
      title: "Professional Achievements",
      items: [
        { ...createBulletItem("Rank 53rd out of 551 teams in Hack The Box Business: Global Cyber Skills Benchmark CTF 2025"), meta: "05/2025" },
        { ...createBulletItem("First prize in an NAB Technical Hack The Box Challenge - Capture The Flag competition of Cyber Month event"), meta: "10/2025" },
        { ...createBulletItem("First prize in an NAB Technical Hack The Box Challenge - Capture The Flag competition of Cyber Month event"), meta: "10/2024" },
        { ...createBulletItem("Third prize in preliminary round of ASEAN Student Contest on Information Security"), meta: "10/2021" },
      ],
    },
    {
      id: createId(),
      sectionTemplate: "work-experience",
      type: "entry-list",
      title: "Work Experience",
      items: [
        createEntryItem({
          title: "National Australia Bank",
          subtitle: "Analyst, Penetration Testing",
          meta: "July 2023 - present",
          tags: "Offensive Security",
          customers: "Internal and External Banking Services of National Australia Bank",
          responsibilities:
            "- Perform vulnerability assessment and penetration testing for web, mobile applications, infrastructure, cloud platforms (AWS, Azure) and public resources.\n- Perform source code review to detect security vulnerabilities.\n- Support architecture reviews to define abuse cases and point out the security gaps that cause vulnerabilities, especially for authorization and business issues.\n- Conduct security research and report research results to widen range of possible test cases for the whole team.\n- Develop internal tools to help automate security processes in team.\n- Support response to security incidents by confirming and exploiting reported vulnerabilities.\n- Report detected vulnerabilities and consult developers in resolving security vulnerabilities.",
          technologies:
            "Qualys, Nessus, NetSparker, Burp Suite, nmap, sqlmap, MOBSF, Frida, Bytecode Viewer, linpeas, winpeas, Java, Python, PHP",
        }),
        createEntryItem({
          title: "FPT Software",
          subtitle: "Penetration Testing, Application Security Engineer",
          meta: "June 2022 - June 2023",
          tags: "Security Assurance Services",
          customers: "Global customers with diverse domains: healthcare, finance, automotive, e-commerce and retail.",
          responsibilities:
            "- Perform vulnerability assessment and penetration testing for web and mobile applications.\n- Perform source code review to detect security vulnerabilities.\n- Mentor and support freshers to be able to work independently.\n- Conduct security research and report research results to widen range of possible test cases for the whole team.\n- Report detected vulnerabilities and consult developers in resolving security vulnerabilities.",
          technologies:
            "Accunetix, HCL AppScan, Nessus, Burp Suite, nmap, sqlmap, MOBSF, Frida, Bytecode Viewer, Java, Python, PHP",
        }),
        createEntryItem({
          title: "FPT Information System",
          subtitle: "Penetration Testing, Vulnerability Assessment",
          meta: "Jan 2021 - May 2022",
          tags: "Cybersecurity Service Division",
          customers: "Domestic customers with diverse domains: banking, financial, national service, etc.",
          responsibilities:
            "- Perform vulnerability assessment and penetration testing for web and mobile applications.\n- Perform source code review to detect security vulnerabilities.\n- Report detected vulnerabilities and consult developers in resolving security vulnerabilities.",
          technologies:
            "Accunetix, HCL AppScan, Nessus, Burp Suite, nmap, sqlmap, MOBSF, Frida, Bytecode Viewer, Java, Python, PHP",
        }),
      ],
    },
  ],
});
