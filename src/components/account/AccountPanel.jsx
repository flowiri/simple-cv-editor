import { useState } from "react";

export function AccountPanel({
  username,
  userId,
  cvCount,
  activeCvName,
  passwordLabel,
  passwordError,
  onChangePassword,
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentPassword || !nextPassword) return;

    const didChange = await onChangePassword(currentPassword, nextPassword);
    if (didChange) {
      setCurrentPassword("");
      setNextPassword("");
    }
  };

  return (
    <section className="workspace-card profile-card">
      <div className="workspace-card-head">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Your account</h1>
          <p className="workspace-copy">
            Review your account details and update your password.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-detail">
          <span>Username</span>
          <strong>{username}</strong>
        </div>
        <div className="profile-detail">
          <span>User ID</span>
          <strong>{userId}</strong>
        </div>
        <div className="profile-detail">
          <span>Total CVs</span>
          <strong>{cvCount}</strong>
        </div>
        <div className="profile-detail">
          <span>Current CV</span>
          <strong>{activeCvName || "No CV selected"}</strong>
        </div>
      </div>

      <form className="account-form" onSubmit={handleSubmit}>
        <div className="workspace-section-head">
          <h2>Change password</h2>
          <p className="panel-caption">Use a new password with at least 8 characters.</p>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              value={nextPassword}
              onChange={(event) => setNextPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>
        </div>

        <div className="account-actions">
          <button type="submit">{passwordLabel}</button>
          {passwordError ? <p className="auth-error">{passwordError}</p> : null}
        </div>
      </form>
    </section>
  );
}
