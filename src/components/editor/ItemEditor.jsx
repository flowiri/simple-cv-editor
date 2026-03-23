import { getSectionKind } from "../../utils/sections.js";
import { parsePublicationCitation } from "../../utils/parsers.js";
import { Field } from "./Field.jsx";
import { TextAreaField } from "./TextAreaField.jsx";
import { FormatField } from "./FormatField.jsx";

const KIND_LABELS = {
  "work-experience": { title: "Company", subtitle: "Job title", tags: "Department", from: "Start Date", to: "End Date" },
  "projects": { title: "Project", subtitle: "Organization", tags: "Role", from: "Start Date", to: "End Date" },
  "education": { title: "Institution", subtitle: "Degree / Major", tags: "Faculty", from: "Enrolled", to: "Graduated" },
};

const DEFAULT_LABELS = { title: "Title", subtitle: "Subtitle", tags: "Tags / Unit", from: "From", to: "To" };

function parseMeta(meta = "") {
  const match = meta.match(/^(.+?)\s*-\s*(.+)$/);
  if (match) return [match[1].trim(), match[2].trim()];
  return [meta.trim(), ""];
}

function joinMeta(from, to) {
  if (from && to) return `${from} - ${to}`;
  return from || to || "";
}

function FromToFields({ metaFrom, metaTo, fromLabel = "From", toLabel = "To", onChange }) {
  return (
    <div className="form-grid">
      <Field
        label={fromLabel}
        value={metaFrom}
        onChange={(v) => onChange("meta", joinMeta(v, metaTo))}
      />
      <Field
        label={toLabel}
        value={metaTo}
        onChange={(v) => onChange("meta", joinMeta(metaFrom, v))}
      />
    </div>
  );
}

export function ItemEditor({
  item,
  type,
  sectionTitle,
  sectionTemplate,
  index,
  lastIndex,
  isActive,
  collapsed,
  registerTarget,
  onToggleCollapse,
  onMove,
  onDelete,
  onChange,
}) {
  const sectionKind = getSectionKind(sectionTitle, type, sectionTemplate);
  const labels = KIND_LABELS[sectionKind] || DEFAULT_LABELS;
  const [metaFrom, metaTo] = parseMeta(item.meta);

  return (
    <div className={`item-editor ${isActive ? "is-inspector-target" : ""}`} ref={registerTarget}>
      <div className="item-toolbar">
        <div className="item-toolbar-copy">
          <span className="item-toolbar-title">Item {index + 1}</span>
          <small className="item-toolbar-meta">{labels.title} and supporting details</small>
        </div>
        <div className="row-controls">
          <button
            className="secondary small icon-btn collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand item" : "Collapse item"}
          >
            {collapsed ? "+" : "-"}
          </button>
          <button
            className="secondary small icon-btn"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            title="Move item up"
          >
            ^
          </button>
          <button
            className="secondary small icon-btn"
            disabled={index === lastIndex}
            onClick={() => onMove(1)}
            title="Move item down"
          >
            v
          </button>
          <button
            className="secondary small icon-btn icon-btn-danger"
            onClick={onDelete}
            title="Delete item"
          >
            x
          </button>
        </div>
      </div>

      {collapsed ? null : type === "bullet-list" ? (
        sectionKind === "achievements" ? (
          <>
            <TextAreaField
              label="Achievement"
              value={item.text || ""}
              formattable
              onChange={(value) => onChange("text", value)}
            />
            <FromToFields
              metaFrom={metaFrom}
              metaTo={metaTo}
              fromLabel="Date"
              toLabel="Until"
              onChange={onChange}
            />
          </>
        ) : sectionKind === "professional-summary" ? null : (
          <TextAreaField
            label="Bullet text"
            value={item.text || ""}
            formattable
            onChange={(value) => onChange("text", value)}
          />
        )
      ) : (
        <>
          {sectionKind === "certificates" ? (
            <>
              <FormatField
                label="Name"
                value={item.title || ""}
                onChange={(value) => onChange("title", value)}
              />
              <FromToFields
                metaFrom={metaFrom}
                metaTo={metaTo}
                fromLabel="Issue Date"
                toLabel="Expiry Date"
                onChange={onChange}
              />
            </>
          ) : sectionKind === "publications" ? (
            <>
              <TextAreaField
                label="Citation"
                value={item.citation || ""}
                formattable
                onChange={(value) => {
                  const parsed = parsePublicationCitation(value);
                  onChange("citation", parsed.citation);
                  onChange("title", parsed.title);
                  onChange("authors", parsed.authors);
                  onChange("venue", parsed.venue);
                  onChange("meta", parsed.meta);
                  onChange("link", parsed.link);
                }}
              />
              <FormatField
                label="Title"
                value={item.title || ""}
                onChange={(value) => onChange("title", value)}
              />
              <TextAreaField
                label="Authors"
                value={item.authors || ""}
                formattable
                onChange={(value) => onChange("authors", value)}
              />
              <TextAreaField
                label="Venue / Publisher"
                value={item.venue || ""}
                formattable
                onChange={(value) => onChange("venue", value)}
              />
              <FromToFields
                metaFrom={metaFrom}
                metaTo={metaTo}
                fromLabel="Published"
                toLabel="Revised"
                onChange={onChange}
              />
              <Field label="Link / DOI" value={item.link || ""} onChange={(value) => onChange("link", value)} />
              <TextAreaField
                label="Notes"
                value={item.notes || ""}
                formattable
                onChange={(value) => onChange("notes", value)}
              />
            </>
          ) : (
            <>
              <FormatField
                label={labels.title}
                value={item.title || ""}
                onChange={(value) => onChange("title", value)}
              />
              <FormatField
                label={labels.subtitle}
                value={item.subtitle || ""}
                onChange={(value) => onChange("subtitle", value)}
              />
              <FromToFields
                metaFrom={metaFrom}
                metaTo={metaTo}
                fromLabel={labels.from}
                toLabel={labels.to}
                onChange={onChange}
              />
              <Field
                label={labels.tags}
                value={item.tags || ""}
                onChange={(value) => onChange("tags", value)}
              />
            </>
          )}
          {sectionKind === "work-experience" ? (
            <>
              <TextAreaField
                label="Clients / Customers"
                value={item.customers || ""}
                formattable
                onChange={(value) => onChange("customers", value)}
              />
              <TextAreaField
                label="Responsibilities"
                value={item.responsibilities || ""}
                formattable
                onChange={(value) => onChange("responsibilities", value)}
              />
              <TextAreaField
                label="Technologies"
                value={item.technologies || ""}
                onChange={(value) => onChange("technologies", value)}
              />
              <TextAreaField
                label="Additional Notes"
                value={item.description || ""}
                formattable
                onChange={(value) => onChange("description", value)}
              />
            </>
          ) : sectionKind === "certificates" || sectionKind === "publications" ? null : (
            <>
              <TextAreaField
                label="Description"
                value={item.description || ""}
                formattable
                onChange={(value) => onChange("description", value)}
              />
              {sectionKind === "projects" ? (
                <Field
                  label="Project Link"
                  value={item.link || ""}
                  onChange={(value) => onChange("link", value)}
                />
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
