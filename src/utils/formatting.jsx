import React from "react";

const formatRules = [
  {
    pattern: /^\*\*([\s\S]+)\*\*$/,
    render: (content, key) => <strong key={key}>{renderFormattedInline(content, `${key}-b`)}</strong>,
  },
  {
    pattern: /^__([\s\S]+)__$/,
    render: (content, key) => <u key={key}>{renderFormattedInline(content, `${key}-u`)}</u>,
  },
  {
    pattern: /^\*([\s\S]+)\*$/,
    render: (content, key) => <em key={key}>{renderFormattedInline(content, `${key}-i`)}</em>,
  },
];

export function renderFormattedInline(text, keyPrefix = "fmt") {
  const value = String(text || "");
  const tokenPattern = /(\*\*[\s\S]+?\*\*|__[\s\S]+?__|\*[\s\S]+?\*)/g;
  const parts = value.split(tokenPattern).filter(Boolean);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    for (const rule of formatRules) {
      const match = part.match(rule.pattern);
      if (match) {
        return rule.render(match[1], key);
      }
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

export function renderFormattedParagraph(text, keyPrefix = "para") {
  return String(text || "")
    .split("\n")
    .map((line, index, lines) => (
      <React.Fragment key={`${keyPrefix}-${index}`}>
        {renderFormattedInline(line, `${keyPrefix}-${index}`)}
        {index < lines.length - 1 ? <br /> : null}
      </React.Fragment>
    ));
}
