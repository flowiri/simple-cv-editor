import { useState } from "react";

export function AuthScreen({ authStatus, authError, onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const isBusy = authStatus === "loading";
  const visibleError = localError || authError;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (!username.trim() || !password) {
      setLocalError("Username and password are required.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (mode === "register") {
      await onRegister(username, password);
      return;
    }

    await onLogin(username, password);
  };

  return (
    <div className="auth-shell">
      <div className="auth-backdrop" aria-hidden="true">
        <div className="auth-orb auth-orb-left" />
        <div className="auth-orb auth-orb-right" />
      </div>

      <section className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">Secure Workspace</p>
          <h1>Sign in to manage your CV library</h1>
          <p className="muted">
            Each account keeps its own list of CVs, supports local credentials, and can export polished PDFs.
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "" : "secondary"}
            onClick={() => {
              setMode("login");
              setLocalError("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "" : "secondary"}
            onClick={() => {
              setMode("register");
              setLocalError("");
            }}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </label>

          {mode === "register" ? (
            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </label>
          ) : null}

          {visibleError ? <p className="auth-error">{visibleError}</p> : null}

          <button type="submit" disabled={isBusy}>
            {isBusy ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
