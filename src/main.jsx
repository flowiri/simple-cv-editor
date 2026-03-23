import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "24px", fontFamily: "Segoe UI, sans-serif", color: "#12202f" }}>
          <h1 style={{ marginTop: 0 }}>CV Builder failed to render</h1>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#fff",
              border: "1px solid #d7dee7",
              borderRadius: "12px",
              padding: "16px"
            }}
          >
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  rootElement.innerHTML =
    '<div style="padding:24px;font-family:Segoe UI, sans-serif;color:#12202f">Loading CV Builder...</div>';

  try {
    ReactDOM.createRoot(rootElement).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (error) {
    rootElement.innerHTML = `
      <div style="padding:24px;font-family:Segoe UI, sans-serif;color:#12202f">
        <h1 style="margin-top:0">Startup error</h1>
        <pre style="white-space:pre-wrap;background:#fff;border:1px solid #d7dee7;border-radius:12px;padding:16px;">${String(error?.stack || error)}</pre>
      </div>
    `;
  }
}
