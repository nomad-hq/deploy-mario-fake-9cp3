"use client";
import {
  createNomadClient,
  getProductionUrl,
  hasNomadToken,
  isPreviewMode,
  skipLoginAsTestUser,
  trackClientEvent
} from "../chunk-3A7EMPDJ.js";

// src/react/provider.tsx
import {
  createContext,
  useContext,
  useMemo
} from "react";
import { jsx } from "react/jsx-runtime";
var NomadContext = createContext(null);
function NomadProvider({
  projectId,
  baseUrl = "https://nomad.red",
  children
}) {
  const value = useMemo(
    () => ({ client: createNomadClient({ projectId, baseUrl }), projectId, baseUrl }),
    [projectId, baseUrl]
  );
  return /* @__PURE__ */ jsx(NomadContext.Provider, { value, children });
}
function useNomadClient(override) {
  const ctx = useContext(NomadContext);
  const envProjectId = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_NOMAD_PROJECT_ID : void 0;
  const envBaseUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_NOMAD_BASE_URL : void 0;
  const oProjectId = override?.projectId;
  const oBaseUrl = override?.baseUrl;
  return useMemo(() => {
    const projectId = oProjectId ?? ctx?.projectId ?? envProjectId;
    const baseUrl = oBaseUrl ?? ctx?.baseUrl ?? envBaseUrl ?? "https://nomad.red";
    if (!projectId) {
      return {
        client: null,
        projectId: null,
        baseUrl,
        error: "NEXT_PUBLIC_NOMAD_PROJECT_ID is required (or pass a projectId prop)"
      };
    }
    if (ctx && !oProjectId && ctx.projectId === projectId) {
      return { client: ctx.client, projectId, baseUrl, error: null };
    }
    return { client: createNomadClient({ projectId, baseUrl }), projectId, baseUrl, error: null };
  }, [ctx, oProjectId, oBaseUrl, envProjectId, envBaseUrl]);
}

// src/react/use-nomad-auth.ts
import { useCallback, useEffect, useState } from "react";
function useNomadAuth(override) {
  const { client } = useNomadClient(override);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    if (!client) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setUser(await client.auth.getCurrentUser());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [client]);
  useEffect(() => {
    void refresh();
    if (typeof window === "undefined") return;
    const onStorage = () => void refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);
  const signOut = useCallback(async () => {
    if (client) await client.auth.signOut();
    setUser(null);
  }, [client]);
  return { user, loading, error, refresh, signOut };
}

// src/react/use-nomad-sessions.ts
import { useCallback as useCallback2, useEffect as useEffect2, useState as useState2 } from "react";
function useNomadSessions(override) {
  const { client } = useNomadClient(override);
  const [sessions, setSessions] = useState2([]);
  const [loading, setLoading] = useState2(true);
  const [error, setError] = useState2(null);
  const refresh = useCallback2(async () => {
    if (!client) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setSessions(await client.auth.listSessions());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [client]);
  useEffect2(() => {
    void refresh();
  }, [refresh]);
  const revoke = useCallback2(
    async (sessionId) => {
      if (!client) return;
      await client.auth.revokeSession(sessionId);
      await refresh();
    },
    [client, refresh]
  );
  const revokeAllOthers = useCallback2(async () => {
    if (!client) return;
    await client.auth.revokeAllOtherSessions();
    await refresh();
  }, [client, refresh]);
  return { sessions, loading, error, refresh, revoke, revokeAllOthers };
}

// src/react/use-nomad-profile.ts
import { useCallback as useCallback3, useEffect as useEffect3, useState as useState3 } from "react";
function useNomadProfile(override) {
  const { client } = useNomadClient(override);
  const [profile, setProfile] = useState3(null);
  const [loading, setLoading] = useState3(true);
  const [error, setError] = useState3(null);
  const refresh = useCallback3(async () => {
    if (!client) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setProfile(await client.auth.getProfile());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [client]);
  useEffect3(() => {
    void refresh();
  }, [refresh]);
  const update = useCallback3(
    async (input) => {
      if (!client) return;
      setProfile(await client.auth.updateProfile(input));
    },
    [client]
  );
  const changePassword = useCallback3(
    async (input) => {
      if (!client) throw new Error("Not ready");
      const res = await client.auth.changePassword(input);
      await refresh();
      return res;
    },
    [client, refresh]
  );
  const unlinkProvider = useCallback3(
    async (provider) => {
      if (!client) return;
      setProfile(await client.auth.unlinkProvider({ provider }));
    },
    [client]
  );
  const deleteAccount = useCallback3(
    async (confirmEmail) => {
      if (!client) return;
      await client.auth.deleteAccount({ confirmEmail });
    },
    [client]
  );
  return {
    profile,
    loading,
    error,
    refresh,
    update,
    changePassword,
    unlinkProvider,
    deleteAccount
  };
}

// src/react/user-profile.tsx
import { useState as useState5 } from "react";

// src/react/two-factor-section.tsx
import { useState as useState4 } from "react";

// src/react/ui.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var C = {
  bg: "#000000",
  surface: "#0a0a0a",
  surface2: "#111111",
  surface3: "#1a1a1a",
  lineSubtle: "rgba(255,255,255,0.06)",
  line: "rgba(255,255,255,0.10)",
  lineStrong: "rgba(255,255,255,0.16)",
  fg: "#ededed",
  muted: "#a1a1a1",
  faint: "#666666",
  accent: "#ffffff",
  danger: "#ee4444",
  ok: "#22c55e"
};
function resolveAppearance(a) {
  return {
    primary: a?.primaryColor ?? C.accent,
    radius: a?.borderRadius ?? "8px"
  };
}
var font = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
var css = `
.nomad-auth ::placeholder{color:${C.faint};opacity:1}
.nomad-auth .nomad-input:focus{border-color:${C.lineStrong};box-shadow:0 0 0 1px ${C.lineStrong}}
.nomad-auth .nomad-oauth:hover:not(:disabled){background:${C.surface2};border-color:${C.lineStrong}}
.nomad-auth .nomad-primary:hover:not(:disabled){background:#e5e5e5;border-color:#e5e5e5}
.nomad-auth .nomad-textlink:hover{color:${C.fg}}
.nomad-auth a.nomad-footlink:hover{text-decoration:underline}
`;
function Screen({
  children,
  background = "transparent"
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "nomad-auth",
      style: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: font,
        background
      },
      children: [
        /* @__PURE__ */ jsx2("style", { dangerouslySetInnerHTML: { __html: css } }),
        children
      ]
    }
  );
}
function Card({ children }) {
  return /* @__PURE__ */ jsx2(
    "div",
    {
      style: {
        width: "100%",
        maxWidth: "384px",
        background: "rgba(0,0,0,0.85)",
        border: `1px solid ${C.line}`,
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        padding: "28px",
        boxSizing: "border-box"
      },
      children
    }
  );
}
function BrandMark(_props) {
  return /* @__PURE__ */ jsx2("div", { style: { textAlign: "center" }, children: /* @__PURE__ */ jsx2(
    "svg",
    {
      viewBox: "110 440 804 175",
      width: "76",
      height: 76 * 175 / 804,
      style: { display: "inline-block" },
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx2(
        "path",
        {
          d: "M128 585 C265 573 353 500 447 455 C490 434 534 434 577 455 C671 500 759 573 896 585 C736 595 643 530 555 504 C525 495 499 495 469 504 C381 530 288 595 128 585Z",
          fill: "#E0C283"
        }
      )
    }
  ) });
}
function Title({ children }) {
  return /* @__PURE__ */ jsx2(
    "h1",
    {
      style: {
        margin: "20px 0 0",
        fontSize: "19px",
        fontWeight: 600,
        letterSpacing: "-0.02em",
        textAlign: "center",
        color: C.fg,
        fontFamily: font
      },
      children
    }
  );
}
function Subtitle({ children }) {
  return /* @__PURE__ */ jsx2(
    "p",
    {
      style: {
        margin: "4px 0 28px",
        fontSize: "13px",
        textAlign: "center",
        color: C.muted,
        fontFamily: font
      },
      children
    }
  );
}
function Label({ children }) {
  return /* @__PURE__ */ jsx2(
    "label",
    {
      style: {
        display: "block",
        marginBottom: "6px",
        fontSize: "12px",
        color: C.faint,
        fontFamily: font
      },
      children
    }
  );
}
function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  primary,
  type = "button"
}) {
  const base = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: font,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
    boxSizing: "border-box",
    transition: "background .15s, border-color .15s"
  };
  if (variant === "primary") {
    return /* @__PURE__ */ jsx2(
      "button",
      {
        className: "nomad-primary",
        type,
        onClick,
        disabled,
        style: {
          ...base,
          height: "32px",
          padding: "0 12px",
          borderRadius: "6px",
          background: primary,
          color: "#000000",
          border: `1px solid ${primary}`
        },
        children
      }
    );
  }
  return /* @__PURE__ */ jsx2(
    "button",
    {
      className: "nomad-oauth",
      type,
      onClick,
      disabled,
      style: {
        ...base,
        height: "40px",
        padding: "0 12px",
        borderRadius: "8px",
        background: "transparent",
        color: C.fg,
        border: `1px solid ${C.line}`
      },
      children
    }
  );
}
function Input(props) {
  return /* @__PURE__ */ jsx2(
    "input",
    {
      className: "nomad-input",
      type: props.type,
      value: props.value,
      placeholder: props.placeholder,
      autoComplete: props.autoComplete,
      disabled: props.disabled,
      onChange: (e) => props.onChange(e.target.value),
      style: {
        width: "100%",
        height: "40px",
        padding: "0 12px",
        fontSize: "13px",
        fontFamily: font,
        color: C.fg,
        background: C.bg,
        border: `1px solid ${C.lineSubtle}`,
        borderRadius: "6px",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color .15s, box-shadow .15s"
      }
    }
  );
}
function Separator() {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: { display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" },
      children: [
        /* @__PURE__ */ jsx2("div", { style: { height: "1px", flex: 1, background: C.lineSubtle } }),
        /* @__PURE__ */ jsx2(
          "span",
          {
            style: { fontSize: "11px", textTransform: "uppercase", color: C.faint },
            children: "or"
          }
        ),
        /* @__PURE__ */ jsx2("div", { style: { height: "1px", flex: 1, background: C.lineSubtle } })
      ]
    }
  );
}
function ErrorText({ children }) {
  if (!children) return null;
  return /* @__PURE__ */ jsx2("p", { style: { margin: "8px 0 0", fontSize: "12px", color: C.danger }, children });
}
function MutedLink({ href, children }) {
  return /* @__PURE__ */ jsx2("a", { className: "nomad-footlink", href, style: { color: C.fg, textDecoration: "none" }, children });
}
function Footer({ children }) {
  return /* @__PURE__ */ jsx2(
    "p",
    {
      style: {
        margin: "20px 0 0",
        fontSize: "12px",
        textAlign: "center",
        color: C.muted,
        fontFamily: font
      },
      children
    }
  );
}
function SecuredByNomad() {
  return /* @__PURE__ */ jsx2(
    "p",
    {
      style: {
        margin: "24px 0 0",
        textAlign: "center",
        fontSize: "11px",
        color: C.faint,
        fontFamily: font
      },
      children: "Secured by Nomad"
    }
  );
}
function GitHubIcon() {
  return /* @__PURE__ */ jsx2("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true, children: /* @__PURE__ */ jsx2("path", { d: "M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" }) });
}
function GoogleIcon() {
  return /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 48 48", "aria-hidden": true, children: [
    /* @__PURE__ */ jsx2("path", { fill: "#EA4335", d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" }),
    /* @__PURE__ */ jsx2("path", { fill: "#4285F4", d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" }),
    /* @__PURE__ */ jsx2("path", { fill: "#FBBC05", d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" }),
    /* @__PURE__ */ jsx2("path", { fill: "#34A853", d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" })
  ] });
}
function CenterMessage({
  title,
  body,
  tone = "muted"
}) {
  const color = tone === "error" ? C.danger : tone === "success" ? "#22c55e" : C.muted;
  return /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", fontFamily: font, color: C.fg }, children: [
    title && /* @__PURE__ */ jsx2("h1", { style: { margin: "0 0 8px", fontSize: "18px", fontWeight: 600, color: C.fg }, children: title }),
    /* @__PURE__ */ jsx2("p", { style: { margin: 0, fontSize: "14px", lineHeight: 1.6, color }, children: body })
  ] });
}

// src/react/two-factor-section.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var ghostBtn = (radius) => ({
  alignSelf: "flex-start",
  border: `1px solid ${C.line}`,
  borderRadius: radius,
  padding: "8px 16px",
  fontSize: 14,
  cursor: "pointer",
  background: "transparent",
  color: C.fg
});
var stack = { display: "flex", flexDirection: "column", gap: "12px" };
function TwoFactorSection({
  client,
  enabled,
  primary,
  radius,
  onChange
}) {
  const [stage, setStage] = useState4("idle");
  const [qr, setQr] = useState4("");
  const [secret, setSecret] = useState4("");
  const [code, setCode] = useState4("");
  const [backup, setBackup] = useState4([]);
  const [error, setError] = useState4("");
  const [busy, setBusy] = useState4(false);
  async function startSetup() {
    if (!client) return;
    setBusy(true);
    setError("");
    try {
      const s = await client.auth.setup2FA();
      setQr(s.qrCode);
      setSecret(s.secret);
      setStage("setup");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start setup");
    } finally {
      setBusy(false);
    }
  }
  async function confirm() {
    if (!client) return;
    setBusy(true);
    setError("");
    try {
      const r = await client.auth.enable2FA({ code });
      setBackup(r.backupCodes);
      setStage("backup");
      setCode("");
      await onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  }
  async function disable() {
    if (!client) return;
    const c = window.prompt("Enter a 2FA code (or a backup code) to turn off 2FA:");
    if (!c) return;
    setBusy(true);
    try {
      await client.auth.disable2FA({ code: c });
      await onChange();
      setStage("idle");
    } catch {
      window.alert("Invalid code.");
    } finally {
      setBusy(false);
    }
  }
  if (enabled && stage !== "backup") {
    return /* @__PURE__ */ jsxs2("div", { style: stack, children: [
      /* @__PURE__ */ jsx3("p", { style: { margin: 0, fontSize: 14, color: C.ok, fontWeight: 600 }, children: "\u2713 Two-factor authentication is on." }),
      /* @__PURE__ */ jsx3(
        "button",
        {
          onClick: disable,
          disabled: busy,
          style: ghostBtn(radius),
          children: busy ? "\u2026" : "Disable 2FA"
        }
      )
    ] });
  }
  if (stage === "backup") {
    return /* @__PURE__ */ jsxs2("div", { style: stack, children: [
      /* @__PURE__ */ jsx3("p", { style: { margin: 0, fontSize: 14, color: C.muted }, children: "Save these backup codes somewhere safe \u2014 each works once if you lose your device." }),
      /* @__PURE__ */ jsx3(
        "pre",
        {
          style: {
            margin: 0,
            padding: "12px",
            background: C.surface2,
            border: `1px solid ${C.lineSubtle}`,
            color: C.fg,
            borderRadius: radius,
            fontSize: 13,
            fontFamily: "ui-monospace, monospace",
            lineHeight: 1.8,
            columnCount: 2
          },
          children: backup.join("\n")
        }
      ),
      /* @__PURE__ */ jsx3(Button, { variant: "primary", primary, radius, onClick: () => setStage("idle"), children: "Done" })
    ] });
  }
  if (stage === "setup") {
    return /* @__PURE__ */ jsxs2("div", { style: stack, children: [
      /* @__PURE__ */ jsx3("p", { style: { margin: 0, fontSize: 14, color: C.muted }, children: "Scan this with Google Authenticator / Authy, then enter the 6-digit code." }),
      qr && // eslint-disable-next-line @next/next/no-img-element
      /* @__PURE__ */ jsx3("img", { src: qr, alt: "2FA QR code", width: 180, height: 180, style: { alignSelf: "center" } }),
      /* @__PURE__ */ jsxs2("p", { style: { margin: 0, fontSize: 12, color: C.muted, wordBreak: "break-all" }, children: [
        "Or enter this key manually: ",
        /* @__PURE__ */ jsx3("code", { children: secret })
      ] }),
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsx3(Label, { children: "Verification code" }),
        /* @__PURE__ */ jsx3(Input, { type: "text", value: code, onChange: setCode, placeholder: "123456", radius, disabled: busy })
      ] }),
      /* @__PURE__ */ jsxs2("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsx3(Button, { variant: "primary", primary, radius, disabled: busy, onClick: confirm, children: busy ? "Enabling\u2026" : "Enable 2FA" }),
        /* @__PURE__ */ jsx3("button", { onClick: () => setStage("idle"), style: { ...ghostBtn(radius), alignSelf: "auto" }, children: "Cancel" })
      ] }),
      /* @__PURE__ */ jsx3(ErrorText, { children: error })
    ] });
  }
  return /* @__PURE__ */ jsxs2("div", { style: stack, children: [
    /* @__PURE__ */ jsx3("p", { style: { margin: 0, fontSize: 14, color: C.muted }, children: "Add an extra layer of security with an authenticator app." }),
    /* @__PURE__ */ jsx3(Button, { variant: "primary", primary, radius, disabled: busy, onClick: startSetup, children: busy ? "\u2026" : "Set up 2FA" }),
    /* @__PURE__ */ jsx3(ErrorText, { children: error })
  ] });
}

// src/react/user-profile.tsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var font2 = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
var stack2 = { display: "flex", flexDirection: "column", gap: "12px" };
function Section({ title, children }) {
  return /* @__PURE__ */ jsxs3(
    "section",
    {
      style: {
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: "12px",
        padding: "24px",
        fontFamily: font2
      },
      children: [
        /* @__PURE__ */ jsx4("h2", { style: { margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: C.fg }, children: title }),
        children
      ]
    }
  );
}
var PROVIDER_LABEL = { google: "Google", github: "GitHub" };
var METHOD_LABEL = {
  email_password: "Email + Password",
  google: "Google",
  github: "GitHub",
  magic_link: "Magic link"
};
function deviceIcon(t) {
  return t === "mobile" || t === "tablet" ? "\u{1F4F1}" : t === "bot" ? "\u{1F916}" : "\u{1F4BB}";
}
function timeAgo(iso) {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1e3);
  if (sec < 60) return "just now";
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function NomadUserProfile({
  afterDeleteUrl = "/",
  appearance,
  projectId,
  baseUrl
}) {
  const override = { projectId, baseUrl };
  const { client, error: clientError } = useNomadClient(override);
  const {
    profile,
    loading,
    error,
    refresh,
    update,
    changePassword,
    unlinkProvider
  } = useNomadProfile(override);
  const { primary, radius } = resolveAppearance(appearance);
  const danger = appearance?.dangerColor ?? "#dc2626";
  const [name, setName] = useState5(null);
  const [avatarEdit, setAvatarEdit] = useState5(false);
  const [avatarUrl, setAvatarUrl] = useState5("");
  const [pwd, setPwd] = useState5({ current: "", next: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState5("");
  const [busy, setBusy] = useState5("");
  const [confirmDelete, setConfirmDelete] = useState5(false);
  const [confirmEmail, setConfirmEmail] = useState5("");
  if (clientError) {
    return /* @__PURE__ */ jsx4(CenterMessage, { tone: "error", title: "Configuration error", body: `NomadUserProfile: ${clientError}` });
  }
  if (loading) return /* @__PURE__ */ jsx4(CenterMessage, { body: "Loading your profile\u2026" });
  if (!profile) {
    if (typeof window !== "undefined") window.location.href = "/sign-in";
    return /* @__PURE__ */ jsx4(CenterMessage, { tone: "error", body: error ?? "You're not signed in." });
  }
  const u = profile.user;
  const m = profile.methods;
  const nameValue = name ?? u.name ?? "";
  async function saveName() {
    setBusy("name");
    try {
      await update({ name: nameValue });
      setName(null);
    } finally {
      setBusy("");
    }
  }
  async function saveAvatar() {
    setBusy("avatar");
    try {
      await update({ avatarUrl });
      setAvatarEdit(false);
    } catch (e) {
      setPwdMsg("");
      alert(e instanceof Error ? e.message : "Invalid avatar URL");
    } finally {
      setBusy("");
    }
  }
  async function submitPassword() {
    setPwdMsg("");
    if (pwd.next.length < 8) return setPwdMsg("Password must be at least 8 characters.");
    if (pwd.next !== pwd.confirm) return setPwdMsg("Passwords don't match.");
    setBusy("pwd");
    try {
      const r = await changePassword({
        currentPassword: u.hasPassword ? pwd.current : void 0,
        newPassword: pwd.next
      });
      setPwd({ current: "", next: "", confirm: "" });
      setPwdMsg(
        `Password ${u.hasPassword ? "updated" : "set"}. ${r.revokedSessionsCount} other session(s) signed out.`
      );
    } catch (e) {
      setPwdMsg(e instanceof Error ? e.message : "Failed to update password");
    } finally {
      setBusy("");
    }
  }
  async function revoke(id) {
    if (!client) return;
    await client.auth.revokeSession(id);
    await refresh();
  }
  async function signOutOthers() {
    if (!client) return;
    setBusy("others");
    try {
      await client.auth.revokeAllOtherSessions();
      await refresh();
    } finally {
      setBusy("");
    }
  }
  async function signOutEverywhere() {
    if (!client) return;
    await client.auth.signOutEverywhere();
    window.location.href = "/sign-in";
  }
  async function doDelete() {
    if (!client) return;
    setBusy("delete");
    try {
      await client.auth.deleteAccount({ confirmEmail });
      window.location.href = afterDeleteUrl;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete account");
      setBusy("");
    }
  }
  const providers = [];
  if (m.google) providers.push("google");
  if (m.github) providers.push("github");
  return /* @__PURE__ */ jsxs3("div", { style: { display: "flex", flexDirection: "column", gap: "16px", maxWidth: "640px", margin: "0 auto", fontFamily: font2 }, children: [
    /* @__PURE__ */ jsxs3(Section, { title: "Account", children: [
      /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }, children: [
        u.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          /* @__PURE__ */ jsx4("img", { src: u.avatarUrl, alt: "", width: 80, height: 80, style: { borderRadius: "50%", objectFit: "cover" } })
        ) : /* @__PURE__ */ jsx4("div", { style: { width: 80, height: 80, borderRadius: "50%", background: C.surface3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: C.muted }, children: (u.name ?? u.email).slice(0, 1).toUpperCase() }),
        /* @__PURE__ */ jsx4("div", { children: avatarEdit ? /* @__PURE__ */ jsxs3("div", { style: { display: "flex", gap: "8px" }, children: [
          /* @__PURE__ */ jsx4(Input, { type: "url", value: avatarUrl, onChange: setAvatarUrl, placeholder: "https://\u2026/avatar.png", radius }),
          /* @__PURE__ */ jsx4(Button, { variant: "primary", primary, radius, disabled: busy === "avatar", onClick: saveAvatar, children: "Save" })
        ] }) : /* @__PURE__ */ jsx4("button", { onClick: () => {
          setAvatarUrl(u.avatarUrl ?? "");
          setAvatarEdit(true);
        }, style: { background: "none", border: "none", color: C.muted, textDecoration: "underline", cursor: "pointer", fontSize: 13, padding: 0 }, children: "Edit avatar" }) })
      ] }),
      /* @__PURE__ */ jsx4("label", { style: { fontSize: 13, fontWeight: 600, color: C.muted }, children: "Name" }),
      /* @__PURE__ */ jsxs3("div", { style: { display: "flex", gap: "8px", marginTop: 4 }, children: [
        /* @__PURE__ */ jsx4(Input, { type: "text", value: nameValue, onChange: (v) => setName(v), placeholder: "Your name", radius }),
        /* @__PURE__ */ jsx4(Button, { variant: "outline", primary, radius, disabled: busy === "name" || (name ?? u.name ?? "") === (u.name ?? ""), onClick: saveName, children: "Save" })
      ] }),
      /* @__PURE__ */ jsxs3("p", { style: { margin: "16px 0 0", fontSize: 14, color: C.muted }, children: [
        u.email,
        " ",
        /* @__PURE__ */ jsx4("span", { style: { marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: u.emailVerified ? "rgba(34,197,94,0.14)" : "rgba(234,179,8,0.14)", color: u.emailVerified ? C.ok : "#eab308" }, children: u.emailVerified ? "Verified" : "Unverified" })
      ] })
    ] }),
    providers.length > 0 && /* @__PURE__ */ jsx4(Section, { title: "Connected accounts", children: /* @__PURE__ */ jsx4("div", { style: stack2, children: providers.map((p) => {
      const linked = profile.linkedAccounts.find((l) => l.provider === p);
      return /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", border: `1px solid ${C.lineSubtle}`, borderRadius: radius, padding: "12px" }, children: [
        /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "center", gap: "10px", fontSize: 14 }, children: [
          p === "github" ? /* @__PURE__ */ jsx4(GitHubIcon, {}) : /* @__PURE__ */ jsx4(GoogleIcon, {}),
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx4("div", { style: { fontWeight: 600, color: C.fg }, children: PROVIDER_LABEL[p] }),
            /* @__PURE__ */ jsx4("div", { style: { color: C.muted, fontSize: 13 }, children: linked ? `${linked.providerEmail ?? linked.providerName ?? "connected"} \xB7 ${timeAgo(linked.createdAt)}` : "Not connected" })
          ] })
        ] }),
        linked ? /* @__PURE__ */ jsx4("button", { onClick: () => {
          if (window.confirm(`Disconnect ${PROVIDER_LABEL[p]}?`)) void unlinkProvider(p);
        }, style: { border: `1px solid ${C.line}`, borderRadius: radius, padding: "6px 12px", fontSize: 13, cursor: "pointer", background: "transparent" }, children: "Disconnect" }) : /* @__PURE__ */ jsx4("button", { onClick: () => p === "github" ? client?.auth.signInWithGitHub() : client?.auth.signInWithGoogle(), style: { border: `1px solid ${C.line}`, borderRadius: radius, padding: "6px 12px", fontSize: 13, cursor: "pointer", background: "transparent" }, children: "Connect" })
      ] }, p);
    }) }) }),
    m.emailPassword && /* @__PURE__ */ jsx4(Section, { title: u.hasPassword ? "Change password" : "Set a password", children: /* @__PURE__ */ jsxs3("div", { style: stack2, children: [
      u.hasPassword && /* @__PURE__ */ jsx4(Input, { type: "password", value: pwd.current, onChange: (v) => setPwd({ ...pwd, current: v }), placeholder: "Current password", autoComplete: "current-password", radius }),
      /* @__PURE__ */ jsx4(Input, { type: "password", value: pwd.next, onChange: (v) => setPwd({ ...pwd, next: v }), placeholder: "New password (min 8)", autoComplete: "new-password", radius }),
      /* @__PURE__ */ jsx4(Input, { type: "password", value: pwd.confirm, onChange: (v) => setPwd({ ...pwd, confirm: v }), placeholder: "Confirm new password", autoComplete: "new-password", radius }),
      /* @__PURE__ */ jsx4(Button, { variant: "primary", primary, radius, disabled: busy === "pwd", onClick: submitPassword, children: busy === "pwd" ? "Saving\u2026" : u.hasPassword ? "Update password" : "Set password" }),
      /* @__PURE__ */ jsx4("p", { style: { margin: 0, fontSize: 12, color: C.muted }, children: "Updating your password signs out all other devices." }),
      pwdMsg && /* @__PURE__ */ jsx4("p", { style: { margin: 0, fontSize: 13, color: C.muted }, children: pwdMsg })
    ] }) }),
    m.twoFactor && /* @__PURE__ */ jsx4(Section, { title: "Two-factor authentication", children: /* @__PURE__ */ jsx4(
      TwoFactorSection,
      {
        client,
        enabled: u.twoFactorEnabled,
        primary,
        radius,
        onChange: refresh
      }
    ) }),
    /* @__PURE__ */ jsx4(Section, { title: `Active sessions (${profile.sessions.length})`, children: /* @__PURE__ */ jsxs3("div", { style: stack2, children: [
      profile.sessions.map((s) => /* @__PURE__ */ jsxs3("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", border: `1px solid ${C.lineSubtle}`, borderRadius: radius, padding: "12px", fontSize: 13 }, children: [
        /* @__PURE__ */ jsxs3("div", { style: { display: "flex", gap: "10px" }, children: [
          /* @__PURE__ */ jsx4("span", { style: { fontSize: 18 }, children: deviceIcon(s.deviceType) }),
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx4("div", { style: { fontWeight: 600, color: C.fg }, children: [s.os, s.browser].filter(Boolean).join(" ") || "Unknown device" }),
            /* @__PURE__ */ jsx4("div", { style: { color: C.muted }, children: [s.city, s.country].filter(Boolean).join(", ") || s.ipAddress || "" }),
            /* @__PURE__ */ jsxs3("div", { style: { color: C.muted }, children: [
              "Signed in via ",
              METHOD_LABEL[s.signInMethod] ?? s.signInMethod,
              " \xB7 last active ",
              timeAgo(s.lastUsedAt)
            ] })
          ] })
        ] }),
        s.isCurrent ? /* @__PURE__ */ jsx4("span", { style: { fontSize: 11, fontWeight: 700, color: C.ok }, children: "Current \u2713" }) : /* @__PURE__ */ jsx4("button", { onClick: () => void revoke(s.id), style: { border: `1px solid ${danger}`, color: danger, borderRadius: radius, padding: "6px 12px", fontSize: 13, cursor: "pointer", background: "transparent" }, children: "Revoke" })
      ] }, s.id)),
      profile.sessions.length > 1 && /* @__PURE__ */ jsx4(Button, { variant: "outline", primary, radius, disabled: busy === "others", onClick: signOutOthers, children: busy === "others" ? "Signing out\u2026" : "Sign out from all other devices" })
    ] }) }),
    /* @__PURE__ */ jsxs3("section", { style: { background: C.surface, border: `1px solid ${danger}33`, borderRadius: "12px", padding: "24px", fontFamily: font2 }, children: [
      /* @__PURE__ */ jsx4("h2", { style: { margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: danger }, children: "Danger zone" }),
      /* @__PURE__ */ jsxs3("div", { style: stack2, children: [
        /* @__PURE__ */ jsx4("button", { onClick: () => {
          if (window.confirm("Sign out from every device, including this one?")) void signOutEverywhere();
        }, style: { alignSelf: "flex-start", border: `1px solid ${C.line}`, borderRadius: radius, padding: "8px 16px", fontSize: 14, cursor: "pointer", background: "transparent" }, children: "Sign out everywhere" }),
        !confirmDelete ? /* @__PURE__ */ jsx4("button", { onClick: () => setConfirmDelete(true), style: { alignSelf: "flex-start", border: `1px solid ${danger}`, color: danger, borderRadius: radius, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", background: "transparent" }, children: "Delete account" }) : /* @__PURE__ */ jsxs3("div", { style: { ...stack2, border: `1px solid ${danger}55`, borderRadius: radius, padding: "16px", background: `${danger}08` }, children: [
          /* @__PURE__ */ jsxs3("p", { style: { margin: 0, fontSize: 13, color: C.muted }, children: [
            "This cannot be undone. Type ",
            /* @__PURE__ */ jsx4("strong", { children: u.email }),
            " to confirm."
          ] }),
          /* @__PURE__ */ jsx4(Input, { type: "email", value: confirmEmail, onChange: setConfirmEmail, placeholder: u.email, radius }),
          /* @__PURE__ */ jsx4(ErrorText, { children: "" }),
          /* @__PURE__ */ jsxs3("div", { style: { display: "flex", gap: "8px" }, children: [
            /* @__PURE__ */ jsx4("button", { onClick: () => void doDelete(), disabled: busy === "delete" || confirmEmail.trim().toLowerCase() !== u.email.toLowerCase(), style: { border: "none", background: danger, color: "#fff", borderRadius: radius, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: confirmEmail.trim().toLowerCase() !== u.email.toLowerCase() ? 0.5 : 1 }, children: busy === "delete" ? "Deleting\u2026" : "Delete my account" }),
            /* @__PURE__ */ jsx4("button", { onClick: () => {
              setConfirmDelete(false);
              setConfirmEmail("");
            }, style: { border: `1px solid ${C.line}`, borderRadius: radius, padding: "8px 16px", fontSize: 14, cursor: "pointer", background: "transparent" }, children: "Cancel" })
          ] })
        ] })
      ] })
    ] })
  ] });
}

// src/react/user-button.tsx
import { useState as useState6 } from "react";

// src/react/cookie.ts
var COOKIE = "nomad_token";
function setTokenCookie(token) {
  if (typeof document === "undefined") return;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${COOKIE}=${token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${secure}`;
}
function clearTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
}

// src/react/user-button.tsx
import { Fragment, jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var font3 = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
function NomadUserButton({
  profileUrl = "/app/profile",
  afterSignOutUrl = "/",
  projectId,
  baseUrl,
  appearance
}) {
  const override = { projectId, baseUrl };
  const { client } = useNomadClient(override);
  const { user, loading, signOut } = useNomadAuth(override);
  const { radius } = resolveAppearance(appearance);
  const [open, setOpen] = useState6(false);
  if (loading || !user) return null;
  const initial = (user.name ?? user.email).slice(0, 1).toUpperCase();
  async function doSignOut() {
    await signOut();
    if (client) {
      try {
        await client.auth.revokeAllOtherSessions();
      } catch {
      }
    }
    clearTokenCookie();
    window.location.href = afterSignOutUrl;
  }
  const avatar = user.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    /* @__PURE__ */ jsx5("img", { src: user.avatarUrl, alt: "", width: 36, height: 36, style: { borderRadius: "50%", objectFit: "cover", display: "block" } })
  ) : /* @__PURE__ */ jsx5("span", { style: { width: 36, height: 36, borderRadius: "50%", background: "#18181b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }, children: initial });
  return /* @__PURE__ */ jsxs4("div", { style: { position: "relative", display: "inline-block", fontFamily: font3 }, children: [
    /* @__PURE__ */ jsx5(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        "aria-label": "Account",
        style: { background: "none", border: "none", padding: 0, cursor: "pointer", borderRadius: "50%", lineHeight: 0 },
        children: avatar
      }
    ),
    open && /* @__PURE__ */ jsxs4(Fragment, { children: [
      /* @__PURE__ */ jsx5("div", { onClick: () => setOpen(false), style: { position: "fixed", inset: 0, zIndex: 40 } }),
      /* @__PURE__ */ jsxs4(
        "div",
        {
          style: {
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 50,
            width: 240,
            background: "rgba(10,10,10,0.97)",
            border: `1px solid ${C.line}`,
            backdropFilter: "blur(12px)",
            borderRadius: `calc(${radius} + 4px)`,
            boxShadow: "0 12px 32px -8px rgba(0,0,0,0.6)",
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ jsxs4("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.lineSubtle}` }, children: [
              avatar,
              /* @__PURE__ */ jsxs4("div", { style: { minWidth: 0 }, children: [
                user.name && /* @__PURE__ */ jsx5("div", { style: { fontSize: 14, fontWeight: 600, color: C.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: user.name }),
                /* @__PURE__ */ jsx5("div", { style: { fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: user.email })
              ] })
            ] }),
            /* @__PURE__ */ jsx5("a", { href: profileUrl, style: { display: "block", padding: "10px 16px", fontSize: 14, color: C.fg, textDecoration: "none" }, children: "Manage account" }),
            /* @__PURE__ */ jsx5("button", { onClick: doSignOut, style: { display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 14, color: C.fg, background: "none", border: "none", borderTop: `1px solid ${C.lineSubtle}`, cursor: "pointer" }, children: "Sign out" })
          ]
        }
      )
    ] })
  ] });
}

// src/react/use-nomad-config.ts
import { useEffect as useEffect4, useState as useState7 } from "react";
var DEFAULTS = {
  emailPassword: true,
  google: true,
  github: true,
  magicLinks: false,
  twoFactor: false
};
var cache = /* @__PURE__ */ new Map();
var TTL = 6e4;
function useNomadConfig(override) {
  const { projectId, baseUrl, error: clientError } = useNomadClient(override);
  const key = projectId ? `${baseUrl}::${projectId}` : null;
  const cached = key ? cache.get(key) : void 0;
  const [state, setState] = useState7(
    () => cached ? { projectName: cached.projectName, methods: cached.methods, loading: false, error: null } : { projectName: null, methods: null, loading: Boolean(projectId), error: clientError }
  );
  useEffect4(() => {
    if (!projectId || !key) {
      setState({ projectName: null, methods: null, loading: false, error: clientError });
      return;
    }
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < TTL) {
      setState({ projectName: hit.projectName, methods: hit.methods, loading: false, error: null });
      return;
    }
    let active = true;
    setState((s) => ({ ...s, loading: true }));
    (async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/sdk/v1/auth/config?projectId=${encodeURIComponent(projectId)}`,
          { headers: { "X-Nomad-Project-Id": projectId } }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Failed to load config");
        const methods = { ...DEFAULTS, ...data.methods };
        cache.set(key, { projectName: data.projectName ?? null, methods, ts: Date.now() });
        if (active) {
          setState({ projectName: data.projectName ?? null, methods, loading: false, error: null });
        }
      } catch (e) {
        if (active) {
          setState({
            projectName: null,
            methods: null,
            loading: false,
            error: e instanceof Error ? e.message : "Failed to load config"
          });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [projectId, baseUrl, key, clientError]);
  return state;
}

// src/react/sign-in.tsx
import { useEffect as useEffect5, useState as useState9 } from "react";

// src/react/magic-link-section.tsx
import { useState as useState8 } from "react";
import { Fragment as Fragment2, jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var stack3 = { display: "flex", flexDirection: "column", gap: "12px" };
function MagicLinkSection({
  client,
  primary,
  radius,
  redirectTo
}) {
  const [email, setEmail] = useState8("");
  const [state, setState] = useState8("idle");
  const [error, setError] = useState8("");
  const target = redirectTo ?? (typeof window !== "undefined" ? window.location.origin + "/oauth-callback" : void 0);
  async function send() {
    if (!client || !email) return;
    setState("sending");
    setError("");
    try {
      await client.auth.signInWithMagicLink({ email, redirectTo: target });
      setState("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send the link");
      setState("error");
    }
  }
  function onSubmit(e) {
    e.preventDefault();
    void send();
  }
  if (state === "sent") {
    return /* @__PURE__ */ jsxs5("div", { style: { textAlign: "center" }, children: [
      /* @__PURE__ */ jsx6("p", { style: { margin: "0 0 4px", fontSize: "14px", fontWeight: 600, color: "#22c55e" }, children: "\u2713 Check your inbox" }),
      /* @__PURE__ */ jsxs5("p", { style: { margin: "0 0 16px", fontSize: "13px", lineHeight: 1.6, color: "#a1a1a1" }, children: [
        "We sent a magic link to ",
        /* @__PURE__ */ jsx6("strong", { children: email }),
        ". Click it to sign in."
      ] }),
      /* @__PURE__ */ jsx6(Button, { variant: "outline", primary, radius, onClick: () => void send(), children: "Resend link" })
    ] });
  }
  return /* @__PURE__ */ jsxs5("form", { onSubmit, style: stack3, children: [
    /* @__PURE__ */ jsx6(
      Input,
      {
        type: "email",
        value: email,
        onChange: setEmail,
        placeholder: "you@example.com",
        autoComplete: "email",
        radius,
        disabled: state === "sending"
      }
    ),
    /* @__PURE__ */ jsx6(Button, { type: "submit", variant: "primary", primary, radius, disabled: state === "sending", children: state === "sending" ? "Sending\u2026" : "Send magic link" }),
    state === "error" && /* @__PURE__ */ jsx6(ErrorText, { children: error })
  ] });
}
function MagicLinkInlineLink({
  client,
  email,
  redirectTo
}) {
  const [state, setState] = useState8("idle");
  const [error, setError] = useState8("");
  const target = redirectTo ?? (typeof window !== "undefined" ? window.location.origin + "/oauth-callback" : void 0);
  async function send() {
    if (!client) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter your email above first.");
      setState("error");
      return;
    }
    setState("sending");
    setError("");
    try {
      await client.auth.signInWithMagicLink({ email, redirectTo: target });
      setState("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the link.");
      setState("error");
    }
  }
  if (state === "sent") {
    return /* @__PURE__ */ jsxs5("p", { style: { margin: "12px 0 0", textAlign: "center", fontSize: "13px", color: "#22c55e" }, children: [
      "\u2713 Magic link sent to ",
      email
    ] });
  }
  return /* @__PURE__ */ jsxs5(Fragment2, { children: [
    /* @__PURE__ */ jsx6(
      "button",
      {
        type: "button",
        className: "nomad-textlink",
        onClick: () => void send(),
        disabled: state === "sending",
        style: {
          margin: "12px 0 0",
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          fontSize: "13px",
          color: "#a1a1a1",
          textAlign: "center",
          cursor: state === "sending" ? "default" : "pointer"
        },
        children: state === "sending" ? "Sending\u2026" : "Email me a magic sign-in link instead"
      }
    ),
    state === "error" && /* @__PURE__ */ jsx6(ErrorText, { children: error })
  ] });
}

// src/react/sign-in.tsx
import { Fragment as Fragment3, jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
var stack4 = { display: "flex", flexDirection: "column", gap: "12px" };
var fieldGap = { display: "flex", flexDirection: "column", gap: "8px" };
function NomadSignIn({
  projectId,
  baseUrl,
  signUpUrl = "/sign-up",
  afterSignInUrl = "/app",
  appearance
}) {
  const override = { projectId, baseUrl };
  const {
    client,
    projectId: resolvedProjectId,
    baseUrl: resolvedBaseUrl,
    error: clientError
  } = useNomadClient(override);
  const { methods, projectName, loading, error: configError } = useNomadConfig(override);
  const { primary, radius } = resolveAppearance(appearance);
  useEffect5(() => {
    if (resolvedProjectId)
      trackClientEvent({
        projectId: resolvedProjectId,
        baseUrl: resolvedBaseUrl,
        type: "signin_viewed"
      });
  }, [resolvedProjectId, resolvedBaseUrl]);
  const [email, setEmail] = useState9("");
  const [password, setPassword] = useState9("");
  const [busy, setBusy] = useState9(null);
  const [formError, setFormError] = useState9("");
  const [challenge, setChallenge] = useState9(null);
  const [code, setCode] = useState9("");
  if (clientError) {
    return /* @__PURE__ */ jsx7(Screen, { children: /* @__PURE__ */ jsx7(CenterMessage, { tone: "error", title: "Configuration error", body: `NomadSignIn: ${clientError}` }) });
  }
  if (loading || !methods) {
    return /* @__PURE__ */ jsx7(Screen, { children: /* @__PURE__ */ jsx7(CenterMessage, { tone: configError ? "error" : "muted", body: configError ?? "Loading\u2026" }) });
  }
  if (!methods.emailPassword && !methods.google && !methods.github && !methods.magicLinks) {
    return /* @__PURE__ */ jsx7(Screen, { children: /* @__PURE__ */ jsx7(CenterMessage, { tone: "error", title: "Sign-in unavailable", body: "No sign-in methods enabled. Contact the administrator." }) });
  }
  function finish(token, verified) {
    setTokenCookie(token);
    window.location.href = verified ? afterSignInUrl : "/verify-email";
  }
  async function onSubmit(e) {
    e.preventDefault();
    if (!client) return;
    setBusy("email");
    setFormError("");
    try {
      const res = await client.auth.signIn({ email, password });
      if ("twoFactorRequired" in res) {
        setChallenge(res.challengeToken);
        setBusy(null);
        return;
      }
      finish(res.token, res.user.emailVerified);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign in failed");
      setBusy(null);
    }
  }
  async function onVerify(e) {
    e.preventDefault();
    if (!client || !challenge) return;
    setBusy("2fa");
    setFormError("");
    try {
      const res = await client.auth.verify2FA({ challengeToken: challenge, code });
      finish(res.token, res.user.emailVerified);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Invalid code");
      setBusy(null);
    }
  }
  if (challenge) {
    return /* @__PURE__ */ jsx7(Screen, { children: /* @__PURE__ */ jsxs6(Card, { radius, children: [
      /* @__PURE__ */ jsx7(BrandMark, { name: projectName ?? void 0 }),
      /* @__PURE__ */ jsx7(Title, { children: "Two-step verification" }),
      /* @__PURE__ */ jsx7(Subtitle, { children: "Enter the code from your authenticator app" }),
      /* @__PURE__ */ jsxs6("form", { onSubmit: onVerify, style: stack4, children: [
        /* @__PURE__ */ jsxs6("div", { children: [
          /* @__PURE__ */ jsx7(Label, { children: "Verification code" }),
          /* @__PURE__ */ jsx7(
            Input,
            {
              type: "text",
              value: code,
              onChange: setCode,
              placeholder: "123456",
              autoComplete: "one-time-code",
              radius,
              disabled: busy === "2fa"
            }
          )
        ] }),
        /* @__PURE__ */ jsx7(Button, { type: "submit", variant: "primary", primary, radius, disabled: busy === "2fa", children: busy === "2fa" ? "Verifying\u2026" : "Verify" }),
        /* @__PURE__ */ jsx7(ErrorText, { children: formError }),
        /* @__PURE__ */ jsx7("p", { style: { margin: 0, fontSize: 12, textAlign: "center", color: "#a1a1a1" }, children: "You can also enter one of your backup codes." })
      ] }),
      /* @__PURE__ */ jsx7(SecuredByNomad, {})
    ] }) });
  }
  const showOAuth = methods.google || methods.github;
  return /* @__PURE__ */ jsx7(Screen, { children: /* @__PURE__ */ jsxs6(Card, { radius, children: [
    /* @__PURE__ */ jsx7(BrandMark, { name: projectName ?? void 0 }),
    /* @__PURE__ */ jsxs6(Title, { children: [
      "Sign in",
      projectName ? ` to ${projectName}` : ""
    ] }),
    /* @__PURE__ */ jsx7(Subtitle, { children: "Welcome back! Please sign in to continue" }),
    showOAuth && /* @__PURE__ */ jsxs6("div", { style: fieldGap, children: [
      methods.google && /* @__PURE__ */ jsxs6(Button, { variant: "outline", radius, primary, disabled: busy !== null, onClick: () => {
        setBusy("google");
        client?.auth.signInWithGoogle();
      }, children: [
        /* @__PURE__ */ jsx7(GoogleIcon, {}),
        " Continue with Google"
      ] }),
      methods.github && /* @__PURE__ */ jsxs6(Button, { variant: "outline", radius, primary, disabled: busy !== null, onClick: () => {
        setBusy("github");
        client?.auth.signInWithGitHub();
      }, children: [
        /* @__PURE__ */ jsx7(GitHubIcon, {}),
        " Continue with GitHub"
      ] })
    ] }),
    showOAuth && (methods.emailPassword || methods.magicLinks) && /* @__PURE__ */ jsx7(Separator, {}),
    methods.emailPassword ? /* @__PURE__ */ jsxs6(Fragment3, { children: [
      /* @__PURE__ */ jsxs6("form", { onSubmit, style: stack4, children: [
        /* @__PURE__ */ jsxs6("div", { children: [
          /* @__PURE__ */ jsx7(Label, { children: "Email address" }),
          /* @__PURE__ */ jsx7(Input, { type: "email", value: email, onChange: setEmail, placeholder: "you@example.com", autoComplete: "email", radius, disabled: busy !== null })
        ] }),
        /* @__PURE__ */ jsxs6("div", { children: [
          /* @__PURE__ */ jsx7(Label, { children: "Password" }),
          /* @__PURE__ */ jsx7(Input, { type: "password", value: password, onChange: setPassword, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete: "current-password", radius, disabled: busy !== null }),
          /* @__PURE__ */ jsx7("div", { style: { marginTop: 6 }, children: /* @__PURE__ */ jsx7("a", { href: "/reset-password", className: "nomad-textlink", style: { fontSize: "12px", color: "#666666", textDecoration: "none" }, children: "Forgot password?" }) })
        ] }),
        /* @__PURE__ */ jsx7(Button, { type: "submit", variant: "primary", radius, primary, disabled: busy !== null, children: busy === "email" ? "Signing in\u2026" : "Continue" })
      ] }),
      methods.magicLinks && /* @__PURE__ */ jsx7(MagicLinkInlineLink, { client, email })
    ] }) : methods.magicLinks && /* @__PURE__ */ jsx7(MagicLinkSection, { client, primary, radius }),
    /* @__PURE__ */ jsx7(ErrorText, { children: formError }),
    /* @__PURE__ */ jsxs6(Footer, { children: [
      "Don't have an account? ",
      /* @__PURE__ */ jsx7(MutedLink, { href: signUpUrl, children: "Sign up" })
    ] }),
    /* @__PURE__ */ jsx7(SecuredByNomad, {})
  ] }) });
}

// src/react/sign-up.tsx
import { useEffect as useEffect6, useState as useState10 } from "react";
import { Fragment as Fragment4, jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
var stack5 = { display: "flex", flexDirection: "column", gap: "12px" };
var fieldGap2 = { display: "flex", flexDirection: "column", gap: "8px" };
function NomadSignUp({
  projectId,
  baseUrl,
  signInUrl = "/sign-in",
  afterSignUpUrl = "/verify-email",
  appearance
}) {
  const override = { projectId, baseUrl };
  const {
    client,
    projectId: resolvedProjectId,
    baseUrl: resolvedBaseUrl,
    error: clientError
  } = useNomadClient(override);
  const { methods, projectName, loading, error: configError } = useNomadConfig(override);
  const { primary, radius } = resolveAppearance(appearance);
  useEffect6(() => {
    if (resolvedProjectId)
      trackClientEvent({
        projectId: resolvedProjectId,
        baseUrl: resolvedBaseUrl,
        type: "signup_viewed"
      });
  }, [resolvedProjectId, resolvedBaseUrl]);
  const [name, setName] = useState10("");
  const [email, setEmail] = useState10("");
  const [password, setPassword] = useState10("");
  const [busy, setBusy] = useState10(null);
  const [formError, setFormError] = useState10("");
  if (clientError) {
    return /* @__PURE__ */ jsx8(Screen, { children: /* @__PURE__ */ jsx8(CenterMessage, { tone: "error", title: "Configuration error", body: `NomadSignUp: ${clientError}` }) });
  }
  if (loading || !methods) {
    return /* @__PURE__ */ jsx8(Screen, { children: /* @__PURE__ */ jsx8(CenterMessage, { tone: configError ? "error" : "muted", body: configError ?? "Loading\u2026" }) });
  }
  if (!methods.emailPassword && !methods.google && !methods.github && !methods.magicLinks) {
    return /* @__PURE__ */ jsx8(Screen, { children: /* @__PURE__ */ jsx8(CenterMessage, { tone: "error", title: "Sign-up unavailable", body: "No sign-in methods enabled. Contact the administrator." }) });
  }
  const showOAuth = methods.google || methods.github;
  async function onSubmit(e) {
    e.preventDefault();
    if (!client) return;
    setBusy("email");
    setFormError("");
    try {
      const { token } = await client.auth.signUp({ email, password, name: name || void 0 });
      setTokenCookie(token);
      window.location.href = afterSignUpUrl;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign up failed");
      setBusy(null);
    }
  }
  return /* @__PURE__ */ jsx8(Screen, { children: /* @__PURE__ */ jsxs7(Card, { radius, children: [
    /* @__PURE__ */ jsx8(BrandMark, { name: projectName ?? void 0 }),
    /* @__PURE__ */ jsx8(Title, { children: "Create your account" }),
    /* @__PURE__ */ jsxs7(Subtitle, { children: [
      "Welcome! Please fill in the details to get started",
      projectName ? ` with ${projectName}` : "",
      "."
    ] }),
    showOAuth && /* @__PURE__ */ jsxs7("div", { style: fieldGap2, children: [
      methods.google && /* @__PURE__ */ jsxs7(Button, { variant: "outline", radius, primary, disabled: busy !== null, onClick: () => {
        setBusy("google");
        client?.auth.signInWithGoogle();
      }, children: [
        /* @__PURE__ */ jsx8(GoogleIcon, {}),
        " Continue with Google"
      ] }),
      methods.github && /* @__PURE__ */ jsxs7(Button, { variant: "outline", radius, primary, disabled: busy !== null, onClick: () => {
        setBusy("github");
        client?.auth.signInWithGitHub();
      }, children: [
        /* @__PURE__ */ jsx8(GitHubIcon, {}),
        " Continue with GitHub"
      ] })
    ] }),
    showOAuth && (methods.emailPassword || methods.magicLinks) && /* @__PURE__ */ jsx8(Separator, {}),
    methods.emailPassword ? /* @__PURE__ */ jsxs7(Fragment4, { children: [
      /* @__PURE__ */ jsxs7("form", { onSubmit, style: stack5, children: [
        /* @__PURE__ */ jsxs7("div", { children: [
          /* @__PURE__ */ jsx8(Label, { children: "Name (optional)" }),
          /* @__PURE__ */ jsx8(Input, { type: "text", value: name, onChange: setName, placeholder: "Your name", autoComplete: "name", radius, disabled: busy !== null })
        ] }),
        /* @__PURE__ */ jsxs7("div", { children: [
          /* @__PURE__ */ jsx8(Label, { children: "Email address" }),
          /* @__PURE__ */ jsx8(Input, { type: "email", value: email, onChange: setEmail, placeholder: "you@example.com", autoComplete: "email", radius, disabled: busy !== null })
        ] }),
        /* @__PURE__ */ jsxs7("div", { children: [
          /* @__PURE__ */ jsx8(Label, { children: "Password" }),
          /* @__PURE__ */ jsx8(Input, { type: "password", value: password, onChange: setPassword, placeholder: "At least 8 characters", autoComplete: "new-password", radius, disabled: busy !== null })
        ] }),
        /* @__PURE__ */ jsx8(Button, { type: "submit", variant: "primary", radius, primary, disabled: busy !== null, children: busy === "email" ? "Creating account\u2026" : "Continue" })
      ] }),
      methods.magicLinks && /* @__PURE__ */ jsx8(MagicLinkInlineLink, { client, email })
    ] }) : methods.magicLinks && /* @__PURE__ */ jsx8(MagicLinkSection, { client, primary, radius }),
    /* @__PURE__ */ jsx8(ErrorText, { children: formError }),
    /* @__PURE__ */ jsxs7(Footer, { children: [
      "Already have an account? ",
      /* @__PURE__ */ jsx8(MutedLink, { href: signInUrl, children: "Sign in" })
    ] }),
    /* @__PURE__ */ jsx8(SecuredByNomad, {})
  ] }) });
}

// src/react/verify-email.tsx
import { useEffect as useEffect7, useState as useState11 } from "react";
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
function NomadVerifyEmail({
  projectId,
  baseUrl,
  afterVerifyUrl = "/app",
  appearance
}) {
  const { client, error: clientError } = useNomadClient({ projectId, baseUrl });
  const { primary, radius } = resolveAppearance(appearance);
  const [email, setEmail] = useState11(null);
  const [checking, setChecking] = useState11(true);
  const [resending, setResending] = useState11(false);
  const [message, setMessage] = useState11("");
  useEffect7(() => {
    if (!client) {
      setChecking(false);
      return;
    }
    let active = true;
    void client.auth.getCurrentUser().then((u) => {
      if (!active) return;
      if (!u) {
        window.location.href = "/sign-in";
        return;
      }
      if (u.emailVerified) {
        window.location.href = afterVerifyUrl;
        return;
      }
      setEmail(u.email);
      setChecking(false);
    });
    const interval = setInterval(async () => {
      const u = await client.auth.getCurrentUser();
      if (u?.emailVerified) {
        clearInterval(interval);
        window.location.href = afterVerifyUrl;
      }
    }, 5e3);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [client, afterVerifyUrl]);
  if (clientError) {
    return /* @__PURE__ */ jsx9(Screen, { children: /* @__PURE__ */ jsx9(CenterMessage, { tone: "error", title: "Configuration error", body: `NomadVerifyEmail: ${clientError}` }) });
  }
  if (checking || !email) {
    return /* @__PURE__ */ jsx9(Screen, { children: /* @__PURE__ */ jsx9(CenterMessage, { body: "Loading\u2026" }) });
  }
  async function resend() {
    if (!client || !email) return;
    setResending(true);
    setMessage("");
    try {
      await client.auth.resendVerificationEmail({ email });
      setMessage("Verification email sent. Check your inbox.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to resend");
    } finally {
      setResending(false);
    }
  }
  async function signOut() {
    if (client) await client.auth.signOut();
    clearTokenCookie();
    window.location.href = "/sign-in";
  }
  return /* @__PURE__ */ jsx9(Screen, { children: /* @__PURE__ */ jsxs8(Card, { radius, children: [
    /* @__PURE__ */ jsx9(BrandMark, {}),
    /* @__PURE__ */ jsx9(Title, { children: "Verify your email" }),
    /* @__PURE__ */ jsxs8(Subtitle, { children: [
      "We sent a verification link to ",
      /* @__PURE__ */ jsx9("strong", { style: { color: C.fg }, children: email }),
      ". Click the link in the email to access your account."
    ] }),
    /* @__PURE__ */ jsx9(Button, { variant: "primary", primary, radius, disabled: resending, onClick: resend, children: resending ? "Sending\u2026" : "Resend verification email" }),
    message && /* @__PURE__ */ jsx9("p", { style: { textAlign: "center", fontSize: "13px", color: C.muted, marginTop: "12px" }, children: message }),
    /* @__PURE__ */ jsxs8("p", { style: { textAlign: "center", fontSize: "13px", color: C.muted, marginTop: "24px" }, children: [
      "Wrong email?",
      " ",
      /* @__PURE__ */ jsx9("span", { onClick: signOut, className: "nomad-textlink", style: { color: C.fg, cursor: "pointer" }, children: "Sign out" })
    ] }),
    /* @__PURE__ */ jsx9(SecuredByNomad, {})
  ] }) });
}

// src/react/oauth-callback.tsx
import { useEffect as useEffect8, useState as useState12 } from "react";
import { jsx as jsx10 } from "react/jsx-runtime";
function NomadOAuthCallback({
  projectId,
  baseUrl,
  afterCallbackUrl = "/app"
}) {
  const { client, error: clientError } = useNomadClient({ projectId, baseUrl });
  const [status, setStatus] = useState12("loading");
  const [errorMsg, setErrorMsg] = useState12("");
  useEffect8(() => {
    if (!client) return;
    void (async () => {
      try {
        const { token } = client.auth.handleOAuthCallback();
        if (!token) {
          setStatus("error");
          setErrorMsg("No token received from the sign-in provider");
          setTimeout(() => {
            window.location.href = "/sign-in";
          }, 2e3);
          return;
        }
        setTokenCookie(token);
        const user = await client.auth.getCurrentUser();
        if (!user) {
          setStatus("error");
          setErrorMsg("Failed to load your account");
          return;
        }
        window.location.href = afterCallbackUrl;
      } catch (e) {
        setStatus("error");
        setErrorMsg(e instanceof Error ? e.message : "Sign-in failed");
      }
    })();
  }, [client, afterCallbackUrl]);
  if (clientError) {
    return /* @__PURE__ */ jsx10(Screen, { children: /* @__PURE__ */ jsx10(CenterMessage, { tone: "error", title: "Configuration error", body: `NomadOAuthCallback: ${clientError}` }) });
  }
  if (status === "error") {
    return /* @__PURE__ */ jsx10(Screen, { children: /* @__PURE__ */ jsx10(CenterMessage, { tone: "error", body: errorMsg }) });
  }
  return /* @__PURE__ */ jsx10(Screen, { children: /* @__PURE__ */ jsx10(CenterMessage, { tone: "success", body: "Signing you in\u2026" }) });
}

// src/react/pricing.tsx
import { useEffect as useEffect9, useState as useState13 } from "react";
import { jsx as jsx11, jsxs as jsxs9 } from "react/jsx-runtime";
var font4 = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
function money(cents, currency) {
  if (cents == null || cents === 0) return "Free";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase()
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
function NomadPricing({
  projectId: projectIdProp,
  baseUrl: baseUrlProp,
  appearance,
  onPlanSelect,
  billingCycle = "monthly",
  successUrl,
  cancelUrl
}) {
  const { client, projectId, baseUrl, error: clientError } = useNomadClient({
    projectId: projectIdProp,
    baseUrl: baseUrlProp
  });
  const { primary, radius } = resolveAppearance(appearance);
  const [plans, setPlans] = useState13(null);
  const [error, setError] = useState13(clientError);
  const [comingSoon, setComingSoon] = useState13(false);
  const [busyId, setBusyId] = useState13(null);
  const [notice, setNotice] = useState13(null);
  useEffect9(() => {
    if (projectId)
      trackClientEvent({ projectId, baseUrl, type: "pricing_viewed" });
  }, [projectId, baseUrl]);
  useEffect9(() => {
    if (!projectId) {
      setError(clientError ?? "Missing projectId");
      return;
    }
    let alive = true;
    fetch(`${baseUrl}/api/sdk/v1/projects/${encodeURIComponent(projectId)}/plans`).then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))).then((d) => alive && setPlans(d.plans ?? [])).catch((e) => alive && setError(e instanceof Error ? e.message : "Failed to load plans"));
    return () => {
      alive = false;
    };
  }, [projectId, baseUrl, clientError]);
  async function select(plan) {
    if (projectId)
      trackClientEvent({
        projectId,
        baseUrl,
        type: "plan_selected",
        metadata: { planId: plan.id }
      });
    if (onPlanSelect) {
      onPlanSelect(plan);
      return;
    }
    const isFree = !plan.priceMonthlyCents && !plan.priceYearlyCents;
    if (isFree || !client) {
      setComingSoon(true);
      return;
    }
    setNotice(null);
    setBusyId(plan.id);
    try {
      await client.payments.checkout({
        planId: plan.id,
        billingCycle,
        successUrl,
        cancelUrl
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Checkout failed";
      setNotice(
        /unauthor/i.test(msg) ? "Please sign in before subscribing." : msg
      );
      setBusyId(null);
    }
  }
  if (error) {
    return /* @__PURE__ */ jsxs9("p", { style: { fontFamily: font4, color: "#b91c1c" }, children: [
      "Could not load pricing: ",
      error
    ] });
  }
  if (!plans) {
    return /* @__PURE__ */ jsx11("p", { style: { fontFamily: font4, color: "#71717a" }, children: "Loading plans\u2026" });
  }
  if (plans.length === 0) {
    return /* @__PURE__ */ jsx11("p", { style: { fontFamily: font4, color: "#71717a" }, children: "No plans available yet." });
  }
  return /* @__PURE__ */ jsxs9("div", { style: { fontFamily: font4, color: "#18181b" }, children: [
    /* @__PURE__ */ jsx11(
      "div",
      {
        style: {
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
        },
        children: plans.map((plan) => {
          const popular = plan.isMostPopular;
          return /* @__PURE__ */ jsxs9(
            "div",
            {
              style: {
                background: "#ffffff",
                border: popular ? `2px solid ${primary}` : "1px solid #e4e4e7",
                borderRadius: `calc(${radius} + 4px)`,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                boxShadow: popular ? "0 12px 32px -12px rgba(0,0,0,0.22)" : "none"
              },
              children: [
                popular && /* @__PURE__ */ jsx11(
                  "span",
                  {
                    style: {
                      alignSelf: "flex-start",
                      background: primary,
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "2px 10px",
                      borderRadius: "999px",
                      marginBottom: "12px"
                    },
                    children: "Most popular"
                  }
                ),
                /* @__PURE__ */ jsx11("h3", { style: { margin: 0, fontSize: "18px", fontWeight: 600 }, children: plan.name }),
                /* @__PURE__ */ jsxs9("div", { style: { marginTop: "8px", display: "flex", alignItems: "baseline", gap: "4px" }, children: [
                  /* @__PURE__ */ jsx11("span", { style: { fontSize: "30px", fontWeight: 700 }, children: money(plan.priceMonthlyCents, plan.currency) }),
                  plan.priceMonthlyCents ? /* @__PURE__ */ jsx11("span", { style: { color: "#71717a", fontSize: "14px" }, children: "/mo" }) : null
                ] }),
                plan.priceYearlyCents ? /* @__PURE__ */ jsxs9("p", { style: { margin: "4px 0 0", color: "#71717a", fontSize: "13px" }, children: [
                  "or ",
                  money(plan.priceYearlyCents, plan.currency),
                  "/yr"
                ] }) : null,
                plan.description && /* @__PURE__ */ jsx11("p", { style: { margin: "12px 0 0", color: "#52525b", fontSize: "14px" }, children: plan.description }),
                /* @__PURE__ */ jsx11("ul", { style: { listStyle: "none", padding: 0, margin: "16px 0", flex: 1 }, children: plan.features.map((f) => /* @__PURE__ */ jsxs9(
                  "li",
                  {
                    style: {
                      display: "flex",
                      gap: "8px",
                      alignItems: "flex-start",
                      fontSize: "14px",
                      color: "#3f3f46",
                      marginBottom: "8px"
                    },
                    children: [
                      /* @__PURE__ */ jsx11("span", { style: { color: primary, fontWeight: 700 }, children: "\u2713" }),
                      f
                    ]
                  },
                  f
                )) }),
                /* @__PURE__ */ jsx11(
                  "button",
                  {
                    type: "button",
                    onClick: () => void select(plan),
                    disabled: busyId === plan.id,
                    style: {
                      width: "100%",
                      padding: "10px 16px",
                      borderRadius: radius,
                      border: popular ? "none" : `1px solid ${primary}`,
                      background: popular ? primary : "transparent",
                      color: popular ? "#fff" : primary,
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: busyId === plan.id ? "default" : "pointer",
                      opacity: busyId === plan.id ? 0.65 : 1
                    },
                    children: busyId === plan.id ? "Redirecting\u2026" : plan.priceMonthlyCents ? "Get started" : "Choose plan"
                  }
                )
              ]
            },
            plan.id
          );
        })
      }
    ),
    notice && /* @__PURE__ */ jsx11(
      "p",
      {
        style: {
          marginTop: "14px",
          color: "#b91c1c",
          fontSize: "13px",
          textAlign: "center"
        },
        children: notice
      }
    ),
    comingSoon && /* @__PURE__ */ jsx11(
      "div",
      {
        onClick: () => setComingSoon(false),
        style: {
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          zIndex: 1e3
        },
        children: /* @__PURE__ */ jsxs9(
          "div",
          {
            onClick: (e) => e.stopPropagation(),
            style: {
              background: "#fff",
              borderRadius: `calc(${radius} + 4px)`,
              padding: "28px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center"
            },
            children: [
              /* @__PURE__ */ jsx11("h3", { style: { margin: 0, fontSize: "18px", fontWeight: 600 }, children: "Coming soon" }),
              /* @__PURE__ */ jsx11("p", { style: { margin: "10px 0 20px", color: "#52525b", fontSize: "14px" }, children: "Payment processing is not yet enabled for this app. The creator is setting up payments \u2014 check back shortly." }),
              /* @__PURE__ */ jsx11(
                "button",
                {
                  type: "button",
                  onClick: () => setComingSoon(false),
                  style: {
                    padding: "10px 20px",
                    borderRadius: radius,
                    border: "none",
                    background: primary,
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer"
                  },
                  children: "Got it"
                }
              )
            ]
          }
        )
      }
    )
  ] });
}

// src/react/preview-banner.tsx
import { useEffect as useEffect10, useRef, useState as useState14 } from "react";
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
function NomadPreviewBanner({
  projectId: projectIdProp,
  baseUrl: baseUrlProp,
  forceVisible,
  autoLogin = true,
  appearance
} = {}) {
  const [dismissed, setDismissed] = useState14(false);
  const [error, setError] = useState14(null);
  const autoRef = useRef(false);
  const override = projectIdProp || baseUrlProp ? { projectId: projectIdProp, baseUrl: baseUrlProp } : void 0;
  const { user, loading, signOut } = useNomadAuth(override);
  const { projectId, baseUrl } = useNomadClient(override);
  const previewMode = forceVisible || isPreviewMode();
  useEffect10(() => {
    if (!previewMode || !autoLogin) return;
    if (!projectId) return;
    if (loading || user) return;
    if (hasNomadToken()) return;
    if (autoRef.current) return;
    autoRef.current = true;
    skipLoginAsTestUser({ projectId, baseUrl }).catch((e) => {
      autoRef.current = false;
      setError(e instanceof Error ? e.message : "Test login failed");
    });
  }, [previewMode, autoLogin, projectId, baseUrl, loading, user]);
  if (!previewMode || dismissed) return null;
  const productionUrl = getProductionUrl();
  const isTestUser = user?.isPreviewTestUser === true;
  const bg = appearance?.background ?? "#111111";
  const text = appearance?.textColor ?? "#fafafa";
  async function handleSignOut() {
    await signOut();
    if (typeof window !== "undefined") window.location.reload();
  }
  const status = error ? error : isTestUser ? "Browsing as test account" : "Signing in as test account\u2026";
  return /* @__PURE__ */ jsxs10(
    "div",
    {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 2147483e3,
        background: bg,
        color: text,
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        fontSize: 13,
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        flexWrap: "wrap"
      },
      children: [
        /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 }, children: [
          /* @__PURE__ */ jsx12("span", { style: { fontSize: 14 }, children: "\u{1F527}" }),
          /* @__PURE__ */ jsx12("strong", { children: "Preview Mode" }),
          /* @__PURE__ */ jsxs10("span", { style: { opacity: 0.6 }, children: [
            "\u2014 ",
            status
          ] })
        ] }),
        /* @__PURE__ */ jsxs10("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
          isTestUser && /* @__PURE__ */ jsx12(
            "button",
            {
              type: "button",
              onClick: handleSignOut,
              style: {
                background: "transparent",
                color: text,
                border: `1px solid ${text}33`,
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 32
              },
              children: "Sign out test user"
            }
          ),
          productionUrl && /* @__PURE__ */ jsx12(
            "a",
            {
              href: productionUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              style: {
                color: text,
                opacity: 0.7,
                textDecoration: "none",
                fontSize: 12,
                borderLeft: `1px solid ${text}33`,
                paddingLeft: 12
              },
              children: "Visit production \u2192"
            }
          ),
          /* @__PURE__ */ jsx12(
            "button",
            {
              type: "button",
              onClick: () => setDismissed(true),
              "aria-label": "Dismiss preview banner",
              style: {
                background: "transparent",
                color: text,
                border: "none",
                cursor: "pointer",
                opacity: 0.5,
                fontSize: 14,
                padding: "0 6px",
                minHeight: 32
              },
              children: "\u2715"
            }
          )
        ] })
      ]
    }
  );
}
export {
  NomadOAuthCallback,
  NomadPreviewBanner,
  NomadPricing,
  NomadProvider,
  NomadSignIn,
  NomadSignUp,
  NomadUserButton,
  NomadUserProfile,
  NomadVerifyEmail,
  useNomadAuth,
  useNomadConfig,
  useNomadProfile,
  useNomadSessions
};
