import { renderFormattedInline } from "../../utils/formatting.jsx";

export function ContactRow({ label, value, link = false }) {
  if (!value) return null;

  return (
    <li>
      <span>{label}:</span>{" "}
      {link ? (
        <a href={value} target="_blank" rel="noreferrer">
          {renderFormattedInline(value, `${label}-value`)}
        </a>
      ) : (
        renderFormattedInline(value, `${label}-value`)
      )}
    </li>
  );
}
