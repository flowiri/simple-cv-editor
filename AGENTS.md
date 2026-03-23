# CV Builder Website Spec

## Better Prompt

Build a web application for creating, editing, and exporting a professional CV/resume.

The default CV template must closely match the visual structure and overall style of the sample files in this project:

- `Phung_Duc_Thang_CV_EN.pdf`
- `Phung_Duc_Thang_CV_EN.docx`

The app should provide a web interface where a user can:

- create a new CV
- update existing CV content
- rearrange sections
- add, edit, or remove entries inside sections
- add custom sections with custom titles
- preview the CV live as they edit
- export the final CV to PDF

The editor should feel similar to top CV builders:

- simple form-based editing
- live preview on the right or below on mobile
- repeatable section items like work experience, education, certificates, projects, and skills
- support for custom sections such as awards, publications, training, volunteer work, or anything user-defined

Important requirements:

- keep the template clean, professional, and ATS-friendly
- preserve the sample CV layout as the default design direction
- allow section ordering and drag/reorder behavior if practical
- support both fixed sections and user-defined sections
- PDF export must closely match the on-screen preview
- the app should work well on desktop and mobile

Please design the system so content is stored in a structured JSON model rather than raw HTML. The preview and PDF should both be generated from the same data model to keep them consistent.

Suggested technical direction:

- frontend: modern React app
- styling: clean print-friendly CSS with A4 layout support
- PDF generation: browser print-to-PDF or a reliable HTML-to-PDF approach
- state model: section-based schema with reusable item types

Deliverables:

- the CV editor UI
- reusable CV preview template
- structured data model for CV content
- support for custom sections
- PDF export flow
- seed data based on the sample CV

## Product Goal

Build a CV editor website where the user can manage resume content through forms instead of manually editing document files. The website should make it easy to maintain one structured CV and export a polished PDF whenever needed.

## Core Experience

The app should have 2 main areas:

- Editor pane: forms for editing content
- Preview pane: live CV preview matching the final exported PDF

The user workflow should be:

1. Open the app.
2. Start from sample CV data or a blank CV.
3. Edit personal info, summary, experience, education, certificates, skills, and other sections.
4. Add a custom section if a built-in section is not enough.
5. Reorder sections.
6. Export to PDF.

## Functional Requirements

### 1. CV Data Management

The app must support:

- personal information
- headline or role title
- summary/objective
- education entries
- work experience entries
- certifications
- achievements
- skills
- links such as LinkedIn, email, website, GitHub
- custom sections

Each repeatable section should allow:

- add item
- edit item
- delete item
- reorder item

### 2. Custom Sections

Custom sections are important.

Users should be able to:

- create a section with a custom title
- choose whether it is paragraph-based, bullet-list-based, or entry-based
- add multiple items inside that custom section
- reorder the custom section like any built-in section

Examples:

- Projects
- Awards
- Publications
- Training
- Volunteer Experience
- Conferences
- Open Source Contributions

### 3. Live Preview

The preview should:

- reflect edits immediately
- match the sample CV aesthetic by default
- be optimized for A4 printing
- keep typography, spacing, heading hierarchy, and section rhythm consistent
- remain readable even when sections become long

### 4. PDF Export

The PDF export should:

- produce an A4 PDF
- closely match the HTML preview
- avoid broken spacing and layout shifts
- handle long content cleanly across pages
- include page margins and print-safe typography

### 5. Responsiveness

Desktop:

- two-column layout is preferred
- left side editor, right side preview

Mobile:

- stacked layout
- easy switching between editor and preview

## Non-Functional Requirements

- clean and maintainable component structure
- structured schema-driven rendering
- avoid hardcoding each section directly into one giant component
- reusable section components
- print-friendly CSS
- easy to add more templates later

## Suggested Data Model

Use a structured JSON model like this:

```json
{
  "basics": {
    "fullName": "Phung Duc Thang",
    "headline": "Penetration Tester",
    "email": "thangpd2305.work@gmail.com",
    "phone": "(+84) 366198046",
    "location": "",
    "website": "https://flowiri.hashnode.dev/",
    "linkedin": "https://www.linkedin.com/in/phung-duc-thang-34b9512b5/",
    "summary": "..."
  },
  "sections": [
    {
      "id": "education",
      "type": "education",
      "title": "Education",
      "items": []
    },
    {
      "id": "experience",
      "type": "experience",
      "title": "Work Experience",
      "items": []
    },
    {
      "id": "custom-projects",
      "type": "custom",
      "title": "Projects",
      "layout": "entry-list",
      "items": []
    }
  ]
}
```

Each section should be rendered based on `type` and `layout`, not by brittle string matching.

## UI Guidance

- Use the sample CV as the default template reference.
- Keep the interface modern but not flashy.
- Prioritize clarity and editing speed.
- Avoid cluttered toolbars or unnecessary formatting controls.
- Prefer structured inputs over freeform rich text where possible.
- For long text fields, use textarea with preview support.

## Template Guidance

The default template should visually echo the sample CV:

- strong name at the top
- concise role title under the name
- clear section headers
- compact spacing
- professional one-page or two-page print layout
- minimal decoration

Do not make it look like a generic marketing landing page. This is a document-focused editor and preview tool.

## Recommended Architecture

- `app`: page shell and routing
- `components/editor`: forms and section editors
- `components/preview`: CV rendering components
- `components/shared`: buttons, inputs, cards, dialogs
- `lib/schema`: section definitions and defaults
- `lib/pdf`: export helpers
- `data`: sample CV seed data

## Nice-to-Have Features

- save/load JSON
- auto-save to local storage
- duplicate section item
- multiple templates later
- import from existing Markdown or DOCX-converted JSON later

## Definition of Done

The feature is done when:

- a user can open the site and edit CV content in the browser
- the preview updates live
- built-in sections can be edited and reordered
- custom sections can be added and managed
- the preview resembles the sample CV template
- the CV can be exported to PDF successfully
- the PDF output is visually close to the preview
