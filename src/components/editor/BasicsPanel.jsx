import { basicsFields } from "../../constants/index.js";
import { Field } from "./Field.jsx";
import { TextAreaField } from "./TextAreaField.jsx";

export function BasicsPanel({
  cvName,
  basics,
  activeInspectorTarget,
  registerEditorTarget,
  updateCvName,
  updateBasics,
}) {
  const isInspectorTarget = activeInspectorTarget === "basics-summary";

  return (
    <section
      className={`panel ${isInspectorTarget ? "is-inspector-target" : ""}`}
      ref={(node) => registerEditorTarget("basics-summary", node)}
    >
      <div className="panel-head">
        <div>
          <h2>Basics</h2>
          <p className="panel-caption">Identity, contact details, and the opening summary recruiters see first.</p>
        </div>
      </div>
      <div className="form-grid">
        <Field
          className="full-span"
          label="CV name"
          value={cvName || ""}
          onChange={updateCvName}
        />
        {basicsFields.map(([key, label]) => (
          <Field
            key={key}
            label={label}
            value={basics[key] || ""}
            onChange={(value) => updateBasics(key, value)}
          />
        ))}
        <TextAreaField
          className="full-span"
          label="Summary / Objective"
          value={basics.summary || ""}
          formattable
          onChange={(value) => updateBasics("summary", value)}
        />
      </div>
    </section>
  );
}
