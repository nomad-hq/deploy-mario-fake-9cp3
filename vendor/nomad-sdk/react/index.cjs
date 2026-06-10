"use strict";
"use client";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/react/index.ts
var react_exports = {};
__export(react_exports, {
  NomadOAuthCallback: () => NomadOAuthCallback,
  NomadPreviewBanner: () => NomadPreviewBanner,
  NomadPricing: () => NomadPricing,
  NomadProvider: () => NomadProvider,
  NomadSignIn: () => NomadSignIn,
  NomadSignUp: () => NomadSignUp,
  NomadUserButton: () => NomadUserButton,
  NomadUserProfile: () => NomadUserProfile,
  NomadVerifyEmail: () => NomadVerifyEmail,
  useNomadAuth: () => useNomadAuth,
  useNomadConfig: () => useNomadConfig,
  useNomadProfile: () => useNomadProfile,
  useNomadSessions: () => useNomadSessions
});
module.exports = __toCommonJS(react_exports);

// src/react/provider.tsx
var import_react = require("react");

// src/errors.ts
var NomadError = class extends Error {
  constructor(message, code, status, details) {
    super(message);
    this.name = "NomadError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
};

// src/auth.ts
function createAuth({ projectId, baseUrl, storage }) {
  async function request(path, init = {}) {
    const headers = {
      "Content-Type": "application/json",
      "X-Nomad-Project-Id": projectId,
      ...init.headers
    };
    if (init.auth) {
      const token = storage.getSession()?.token;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    let res;
    try {
      res = await fetch(`${baseUrl}${path}`, { ...init, headers });
    } catch {
      throw new NomadError("Could not reach Nomad", "NETWORK_ERROR");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new NomadError(
        data.error ?? `Request failed (${res.status})`,
        data.code ?? "UNKNOWN",
        res.status,
        data
      );
    }
    return data;
  }
  function startOAuth(provider, options) {
    if (typeof window === "undefined") {
      throw new NomadError(
        "OAuth sign-in must run in a browser",
        "INVALID_INPUT"
      );
    }
    const redirectTo = options?.redirectTo ?? `${window.location.origin}/oauth-callback`;
    const url = `${baseUrl}/api/sdk/v1/auth/oauth/${provider}/init?projectId=${encodeURIComponent(projectId)}&redirectTo=${encodeURIComponent(redirectTo)}`;
    window.location.href = url;
  }
  return {
    async signUp(input) {
      const data = await request("/api/sdk/v1/auth/signup", {
        method: "POST",
        body: JSON.stringify(input)
      });
      storage.setSession({ token: data.token, user: data.user });
      return data;
    },
    async signIn(input) {
      const data = await request(
        "/api/sdk/v1/auth/signin",
        { method: "POST", body: JSON.stringify(input) }
      );
      if ("twoFactorRequired" in data && data.twoFactorRequired) {
        return data;
      }
      const auth = data;
      storage.setSession({ token: auth.token, user: auth.user });
      return auth;
    },
    async signOut() {
      if (storage.getSession()?.token) {
        try {
          await request("/api/sdk/v1/auth/signout", {
            method: "POST",
            auth: true
          });
        } catch {
        }
      }
      storage.clearSession();
    },
    async getCurrentUser() {
      const session = storage.getSession();
      if (!session?.token) return null;
      try {
        const data = await request(
          "/api/sdk/v1/auth/me",
          { method: "GET", auth: true }
        );
        storage.setSession({ token: session.token, user: data.user });
        return data.user;
      } catch (error) {
        if (error instanceof NomadError && error.status === 401) {
          storage.clearSession();
          return null;
        }
        throw error;
      }
    },
    isSignedIn() {
      return Boolean(storage.getSession()?.token);
    },
    async sendEmailVerification(input) {
      const email = input?.email ?? storage.getSession()?.user?.email;
      if (!email) {
        throw new NomadError(
          "No email provided and no signed-in user",
          "INVALID_INPUT"
        );
      }
      return request("/api/sdk/v1/auth/send-verification", {
        method: "POST",
        body: JSON.stringify({ email })
      });
    },
    async resendVerificationEmail(input) {
      const email = input?.email ?? storage.getSession()?.user?.email;
      const hasToken = Boolean(storage.getSession()?.token);
      if (!email && !hasToken) {
        throw new NomadError(
          "No email provided and no signed-in user",
          "INVALID_INPUT"
        );
      }
      return request("/api/sdk/v1/auth/resend-verification", {
        method: "POST",
        auth: true,
        body: JSON.stringify(email ? { email } : {})
      });
    },
    async requestPasswordReset(input) {
      return request(
        "/api/sdk/v1/auth/request-password-reset",
        { method: "POST", body: JSON.stringify(input) }
      );
    },
    async resetPassword(input) {
      return request(
        "/api/sdk/v1/auth/reset-password",
        { method: "POST", body: JSON.stringify(input) }
      );
    },
    signInWithGoogle(options) {
      startOAuth("google", options);
    },
    signInWithGitHub(options) {
      startOAuth("github", options);
    },
    async signInWithMagicLink(input) {
      if (!input?.email || !input.email.includes("@")) {
        throw new NomadError("A valid email is required", "INVALID_INPUT");
      }
      return request("/api/sdk/v1/auth/magic-link/request", {
        method: "POST",
        body: JSON.stringify({
          email: input.email,
          redirectTo: input.redirectTo
        })
      });
    },
    async listSessions() {
      const data = await request(
        "/api/sdk/v1/auth/sessions",
        { method: "GET", auth: true }
      );
      return data.sessions;
    },
    async revokeSession(sessionId) {
      return request(
        `/api/sdk/v1/auth/sessions/${encodeURIComponent(sessionId)}/revoke`,
        { method: "POST", auth: true, body: JSON.stringify({ reason: "user" }) }
      );
    },
    async revokeAllOtherSessions() {
      return request(
        "/api/sdk/v1/auth/sessions/revoke-all",
        { method: "POST", auth: true, body: JSON.stringify({ exceptCurrent: true }) }
      );
    },
    async signOutEverywhere() {
      const data = await request(
        "/api/sdk/v1/auth/sessions/revoke-all",
        { method: "POST", auth: true, body: JSON.stringify({ exceptCurrent: false }) }
      );
      storage.clearSession();
      return data;
    },
    async getProfile() {
      return request("/api/sdk/v1/auth/profile", {
        method: "GET",
        auth: true
      });
    },
    async updateProfile(input) {
      return request("/api/sdk/v1/auth/profile", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(input)
      });
    },
    async changePassword(input) {
      return request(
        "/api/sdk/v1/auth/profile/change-password",
        { method: "POST", auth: true, body: JSON.stringify(input) }
      );
    },
    async unlinkProvider(input) {
      return request("/api/sdk/v1/auth/profile/unlink-provider", {
        method: "POST",
        auth: true,
        body: JSON.stringify(input)
      });
    },
    async deleteAccount(input) {
      const data = await request("/api/sdk/v1/auth/profile", {
        method: "DELETE",
        auth: true,
        body: JSON.stringify(input)
      });
      storage.clearSession();
      return data;
    },
    async setup2FA() {
      return request("/api/sdk/v1/auth/2fa/setup", {
        method: "POST",
        auth: true
      });
    },
    async enable2FA(input) {
      return request("/api/sdk/v1/auth/2fa/enable", {
        method: "POST",
        auth: true,
        body: JSON.stringify(input)
      });
    },
    async disable2FA(input) {
      return request("/api/sdk/v1/auth/2fa/disable", {
        method: "POST",
        auth: true,
        body: JSON.stringify(input)
      });
    },
    async verify2FA(input) {
      const data = await request("/api/sdk/v1/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify(input)
      });
      storage.setSession({ token: data.token, user: data.user });
      return data;
    },
    handleOAuthCallback() {
      if (typeof window === "undefined") return { token: null };
      const params = new URLSearchParams(window.location.search);
      const token = params.get("nomad_token");
      if (!token) return { token: null };
      storage.setSession({ token });
      params.delete("nomad_token");
      params.delete("nomad_error");
      const query = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (query ? `?${query}` : "")
      );
      return { token };
    }
  };
}

// src/payments.ts
function createPayments({
  projectId,
  baseUrl,
  storage
}) {
  async function request(path, init) {
    const headers = {
      "Content-Type": "application/json",
      "X-Nomad-Project-Id": projectId
    };
    const token = storage.getSession()?.token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    let res;
    try {
      res = await fetch(`${baseUrl}${path}`, { ...init, headers });
    } catch {
      throw new NomadError("Could not reach Nomad", "NETWORK_ERROR");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new NomadError(
        data.error ?? `Request failed (${res.status})`,
        data.code ?? "UNKNOWN",
        res.status,
        data
      );
    }
    return data;
  }
  return {
    async checkout(input) {
      const here = typeof window !== "undefined" ? window.location.href : void 0;
      const successUrl = input.successUrl ?? here;
      const cancelUrl = input.cancelUrl ?? successUrl;
      if (!successUrl || !cancelUrl) {
        throw new NomadError(
          "successUrl and cancelUrl are required outside the browser",
          "INVALID_INPUT"
        );
      }
      const data = await request(
        `/api/sdk/v1/projects/${encodeURIComponent(projectId)}/checkout`,
        {
          method: "POST",
          body: JSON.stringify({
            planId: input.planId,
            billingCycle: input.billingCycle ?? "monthly",
            successUrl,
            cancelUrl
          })
        }
      );
      if (input.redirect !== false && typeof window !== "undefined" && data.url) {
        window.location.href = data.url;
      }
      return data;
    }
  };
}

// src/storage.ts
function createStorage(projectId) {
  const key = `nomad:auth:${projectId}`;
  let ls;
  try {
    const candidate = globalThis.localStorage;
    if (candidate) {
      candidate.getItem(key);
      ls = candidate;
    }
  } catch {
    ls = void 0;
  }
  if (ls) {
    return {
      getSession() {
        try {
          const raw = ls.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      },
      setSession(session) {
        ls.setItem(key, JSON.stringify(session));
      },
      clearSession() {
        ls.removeItem(key);
      }
    };
  }
  let memory = null;
  return {
    getSession() {
      return memory;
    },
    setSession(session) {
      memory = session;
    },
    clearSession() {
      memory = null;
    }
  };
}

// src/client.ts
var DEFAULT_BASE_URL = "https://nomad.red";
function createNomadClient(config) {
  const projectId = config.projectId;
  const baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  const storage = config.storage ?? createStorage(projectId);
  return {
    projectId,
    auth: createAuth({ projectId, baseUrl, storage }),
    payments: createPayments({ projectId, baseUrl, storage })
  };
}
var env = globalThis.process?.env ?? {};
var nomad = createNomadClient({
  projectId: env.NOMAD_PROJECT_ID ?? "",
  baseUrl: env.NOMAD_API_URL ?? DEFAULT_BASE_URL
});

// src/react/provider.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var NomadContext = (0, import_react.createContext)(null);
function NomadProvider({
  projectId,
  baseUrl = "https://nomad.red",
  children
}) {
  const value = (0, import_react.useMemo)(
    () => ({ client: createNomadClient({ projectId, baseUrl }), projectId, baseUrl }),
    [projectId, baseUrl]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NomadContext.Provider, { value, children });
}
function useNomadClient(override) {
  const ctx = (0, import_react.useContext)(NomadContext);
  const envProjectId = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_NOMAD_PROJECT_ID : void 0;
  const envBaseUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_NOMAD_BASE_URL : void 0;
  const oProjectId = override?.projectId;
  const oBaseUrl = override?.baseUrl;
  return (0, import_react.useMemo)(() => {
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
var import_react2 = require("react");
function useNomadAuth(override) {
  const { client } = useNomadClient(override);
  const [user, setUser] = (0, import_react2.useState)(null);
  const [loading, setLoading] = (0, import_react2.useState)(true);
  const [error, setError] = (0, import_react2.useState)(null);
  const refresh = (0, import_react2.useCallback)(async () => {
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
  (0, import_react2.useEffect)(() => {
    void refresh();
    if (typeof window === "undefined") return;
    const onStorage = () => void refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);
  const signOut = (0, import_react2.useCallback)(async () => {
    if (client) await client.auth.signOut();
    setUser(null);
  }, [client]);
  return { user, loading, error, refresh, signOut };
}

// src/react/use-nomad-sessions.ts
var import_react3 = require("react");
function useNomadSessions(override) {
  const { client } = useNomadClient(override);
  const [sessions, setSessions] = (0, import_react3.useState)([]);
  const [loading, setLoading] = (0, import_react3.useState)(true);
  const [error, setError] = (0, import_react3.useState)(null);
  const refresh = (0, import_react3.useCallback)(async () => {
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
  (0, import_react3.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const revoke = (0, import_react3.useCallback)(
    async (sessionId) => {
      if (!client) return;
      await client.auth.revokeSession(sessionId);
      await refresh();
    },
    [client, refresh]
  );
  const revokeAllOthers = (0, import_react3.useCallback)(async () => {
    if (!client) return;
    await client.auth.revokeAllOtherSessions();
    await refresh();
  }, [client, refresh]);
  return { sessions, loading, error, refresh, revoke, revokeAllOthers };
}

// src/react/use-nomad-profile.ts
var import_react4 = require("react");
function useNomadProfile(override) {
  const { client } = useNomadClient(override);
  const [profile, setProfile] = (0, import_react4.useState)(null);
  const [loading, setLoading] = (0, import_react4.useState)(true);
  const [error, setError] = (0, import_react4.useState)(null);
  const refresh = (0, import_react4.useCallback)(async () => {
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
  (0, import_react4.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const update = (0, import_react4.useCallback)(
    async (input) => {
      if (!client) return;
      setProfile(await client.auth.updateProfile(input));
    },
    [client]
  );
  const changePassword = (0, import_react4.useCallback)(
    async (input) => {
      if (!client) throw new Error("Not ready");
      const res = await client.auth.changePassword(input);
      await refresh();
      return res;
    },
    [client, refresh]
  );
  const unlinkProvider = (0, import_react4.useCallback)(
    async (provider) => {
      if (!client) return;
      setProfile(await client.auth.unlinkProvider({ provider }));
    },
    [client]
  );
  const deleteAccount = (0, import_react4.useCallback)(
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
var import_react6 = require("react");

// src/react/two-factor-section.tsx
var import_react5 = require("react");

// src/react/ui.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function resolveAppearance(a) {
  return {
    primary: a?.primaryColor ?? "#18181b",
    radius: a?.borderRadius ?? "8px"
  };
}
var font = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
function Screen({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      style: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f4f5",
        padding: "24px",
        fontFamily: font
      },
      children
    }
  );
}
function Card({
  children,
  radius
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      style: {
        width: "100%",
        maxWidth: "400px",
        background: "#ffffff",
        border: "1px solid #e4e4e7",
        borderRadius: `calc(${radius} + 4px)`,
        boxShadow: "0 10px 30px -12px rgba(0,0,0,0.18)",
        padding: "32px",
        boxSizing: "border-box"
      },
      children
    }
  );
}
function Title({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "h1",
    {
      style: {
        margin: "0 0 6px",
        fontSize: "21px",
        fontWeight: 700,
        textAlign: "center",
        letterSpacing: "-0.01em",
        color: "#18181b"
      },
      children
    }
  );
}
function Subtitle({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "p",
    {
      style: {
        margin: "0 0 24px",
        fontSize: "14px",
        textAlign: "center",
        color: "#71717a",
        fontFamily: font
      },
      children
    }
  );
}
function Label({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "label",
    {
      style: {
        display: "block",
        marginBottom: "6px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#3f3f46",
        fontFamily: font
      },
      children
    }
  );
}
function BrandMark({ name }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      style: {
        width: 44,
        height: 44,
        margin: "0 auto 16px",
        borderRadius: "12px",
        background: "#18181b",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        fontWeight: 700
      },
      children: (name ?? "\u2022").slice(0, 1).toUpperCase()
    }
  );
}
function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  primary,
  radius,
  type = "button"
}) {
  const base = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: font,
    borderRadius: radius,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.6 : 1,
    border: "1px solid transparent",
    boxSizing: "border-box"
  };
  const variants = {
    primary: { background: primary, color: "#ffffff" },
    dark: { background: "#18181b", color: "#ffffff" },
    outline: { background: "#ffffff", color: "#18181b", borderColor: "#e4e4e7" }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "button",
    {
      type,
      onClick,
      disabled,
      style: { ...base, ...variants[variant] },
      children
    }
  );
}
function Input(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "input",
    {
      type: props.type,
      value: props.value,
      placeholder: props.placeholder,
      autoComplete: props.autoComplete,
      disabled: props.disabled,
      onChange: (e) => props.onChange(e.target.value),
      style: {
        width: "100%",
        padding: "11px 12px",
        // 16px so iOS Safari doesn't auto-zoom the page on focus.
        fontSize: "16px",
        fontFamily: font,
        color: "#18181b",
        background: "#ffffff",
        border: "1px solid #d4d4d8",
        borderRadius: props.radius,
        outline: "none",
        boxSizing: "border-box"
      }
    }
  );
}
function Separator() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "20px 0"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { height: "1px", flex: 1, background: "#e4e4e7" } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { fontSize: "12px", color: "#a1a1aa" }, children: "or" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { height: "1px", flex: 1, background: "#e4e4e7" } })
      ]
    }
  );
}
function ErrorText({ children }) {
  if (!children) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { margin: "8px 0 0", fontSize: "13px", color: "#dc2626" }, children });
}
function MutedLink({ href, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("a", { href, style: { color: "#18181b", textDecoration: "underline" }, children });
}
function Footer({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "p",
    {
      style: {
        margin: "20px 0 0",
        fontSize: "13px",
        textAlign: "center",
        color: "#71717a",
        fontFamily: font
      },
      children
    }
  );
}
function SecuredByNomad() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "p",
    {
      style: {
        margin: "20px 0 0",
        textAlign: "center",
        fontSize: "11px",
        color: "#a1a1aa",
        fontFamily: font,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm-1 16-4-4 1.41-1.41L11 14.17l5.59-5.59L18 10l-7 7Z" }) }),
        "Secured by Nomad"
      ]
    }
  );
}
function GitHubIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" }) });
}
function GoogleIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: "16", height: "16", viewBox: "0 0 48 48", "aria-hidden": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { fill: "#EA4335", d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { fill: "#4285F4", d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { fill: "#FBBC05", d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { fill: "#34A853", d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" })
  ] });
}
function CenterMessage({
  title,
  body,
  tone = "muted"
}) {
  const color = tone === "error" ? "#dc2626" : tone === "success" ? "#16a34a" : "#71717a";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { textAlign: "center", fontFamily: font }, children: [
    title && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h1", { style: { margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#18181b" }, children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { margin: 0, fontSize: "14px", lineHeight: 1.6, color }, children: body })
  ] });
}

// src/react/two-factor-section.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var stack = { display: "flex", flexDirection: "column", gap: "12px" };
function TwoFactorSection({
  client,
  enabled,
  primary,
  radius,
  onChange
}) {
  const [stage, setStage] = (0, import_react5.useState)("idle");
  const [qr, setQr] = (0, import_react5.useState)("");
  const [secret, setSecret] = (0, import_react5.useState)("");
  const [code, setCode] = (0, import_react5.useState)("");
  const [backup, setBackup] = (0, import_react5.useState)([]);
  const [error, setError] = (0, import_react5.useState)("");
  const [busy, setBusy] = (0, import_react5.useState)(false);
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
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: stack, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { style: { margin: 0, fontSize: 14, color: "#16a34a", fontWeight: 600 }, children: "\u2713 Two-factor authentication is on." }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          onClick: disable,
          disabled: busy,
          style: { alignSelf: "flex-start", border: "1px solid #d4d4d8", borderRadius: radius, padding: "8px 16px", fontSize: 14, cursor: "pointer", background: "#fff" },
          children: busy ? "\u2026" : "Disable 2FA"
        }
      )
    ] });
  }
  if (stage === "backup") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: stack, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { style: { margin: 0, fontSize: 14, color: "#3f3f46" }, children: "Save these backup codes somewhere safe \u2014 each works once if you lose your device." }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "pre",
        {
          style: {
            margin: 0,
            padding: "12px",
            background: "#f4f4f5",
            borderRadius: radius,
            fontSize: 13,
            fontFamily: "ui-monospace, monospace",
            lineHeight: 1.8,
            columnCount: 2
          },
          children: backup.join("\n")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { variant: "primary", primary, radius, onClick: () => setStage("idle"), children: "Done" })
    ] });
  }
  if (stage === "setup") {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: stack, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { style: { margin: 0, fontSize: 14, color: "#3f3f46" }, children: "Scan this with Google Authenticator / Authy, then enter the 6-digit code." }),
      qr && // eslint-disable-next-line @next/next/no-img-element
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("img", { src: qr, alt: "2FA QR code", width: 180, height: 180, style: { alignSelf: "center" } }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { style: { margin: 0, fontSize: 12, color: "#71717a", wordBreak: "break-all" }, children: [
        "Or enter this key manually: ",
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { children: secret })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Label, { children: "Verification code" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Input, { type: "text", value: code, onChange: setCode, placeholder: "123456", radius, disabled: busy })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { variant: "primary", primary, radius, disabled: busy, onClick: confirm, children: busy ? "Enabling\u2026" : "Enable 2FA" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setStage("idle"), style: { border: "1px solid #d4d4d8", borderRadius: radius, padding: "8px 16px", fontSize: 14, cursor: "pointer", background: "#fff" }, children: "Cancel" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ErrorText, { children: error })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: stack, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { style: { margin: 0, fontSize: 14, color: "#3f3f46" }, children: "Add an extra layer of security with an authenticator app." }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { variant: "primary", primary, radius, disabled: busy, onClick: startSetup, children: busy ? "\u2026" : "Set up 2FA" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ErrorText, { children: error })
  ] });
}

// src/react/user-profile.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var font2 = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
var stack2 = { display: "flex", flexDirection: "column", gap: "12px" };
function Section({ title, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "section",
    {
      style: {
        background: "#fff",
        border: "1px solid #e4e4e7",
        borderRadius: "12px",
        padding: "24px",
        fontFamily: font2
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { style: { margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#18181b" }, children: title }),
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
  const [name, setName] = (0, import_react6.useState)(null);
  const [avatarEdit, setAvatarEdit] = (0, import_react6.useState)(false);
  const [avatarUrl, setAvatarUrl] = (0, import_react6.useState)("");
  const [pwd, setPwd] = (0, import_react6.useState)({ current: "", next: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = (0, import_react6.useState)("");
  const [busy, setBusy] = (0, import_react6.useState)("");
  const [confirmDelete, setConfirmDelete] = (0, import_react6.useState)(false);
  const [confirmEmail, setConfirmEmail] = (0, import_react6.useState)("");
  if (clientError) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CenterMessage, { tone: "error", title: "Configuration error", body: `NomadUserProfile: ${clientError}` });
  }
  if (loading) return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CenterMessage, { body: "Loading your profile\u2026" });
  if (!profile) {
    if (typeof window !== "undefined") window.location.href = "/sign-in";
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CenterMessage, { tone: "error", body: error ?? "You're not signed in." });
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
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "16px", maxWidth: "640px", margin: "0 auto", fontFamily: font2 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Section, { title: "Account", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }, children: [
        u.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("img", { src: u.avatarUrl, alt: "", width: 80, height: 80, style: { borderRadius: "50%", objectFit: "cover" } })
        ) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { width: 80, height: 80, borderRadius: "50%", background: "#e4e4e7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#52525b" }, children: (u.name ?? u.email).slice(0, 1).toUpperCase() }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: avatarEdit ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Input, { type: "url", value: avatarUrl, onChange: setAvatarUrl, placeholder: "https://\u2026/avatar.png", radius }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { variant: "primary", primary, radius, disabled: busy === "avatar", onClick: saveAvatar, children: "Save" })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => {
          setAvatarUrl(u.avatarUrl ?? "");
          setAvatarEdit(true);
        }, style: { background: "none", border: "none", color: "#3f3f46", textDecoration: "underline", cursor: "pointer", fontSize: 13, padding: 0 }, children: "Edit avatar" }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { style: { fontSize: 13, fontWeight: 600, color: "#3f3f46" }, children: "Name" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: "8px", marginTop: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Input, { type: "text", value: nameValue, onChange: (v) => setName(v), placeholder: "Your name", radius }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { variant: "outline", primary, radius, disabled: busy === "name" || (name ?? u.name ?? "") === (u.name ?? ""), onClick: saveName, children: "Save" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { style: { margin: "16px 0 0", fontSize: 14, color: "#3f3f46" }, children: [
        u.email,
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: u.emailVerified ? "#dcfce7" : "#fef9c3", color: u.emailVerified ? "#16a34a" : "#a16207" }, children: u.emailVerified ? "Verified" : "Unverified" })
      ] })
    ] }),
    providers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Section, { title: "Connected accounts", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: stack2, children: providers.map((p) => {
      const linked = profile.linkedAccounts.find((l) => l.provider === p);
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", border: "1px solid #f4f4f5", borderRadius: radius, padding: "12px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: "10px", fontSize: 14 }, children: [
          p === "github" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(GitHubIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(GoogleIcon, {}),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontWeight: 600, color: "#18181b" }, children: PROVIDER_LABEL[p] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { color: "#71717a", fontSize: 13 }, children: linked ? `${linked.providerEmail ?? linked.providerName ?? "connected"} \xB7 ${timeAgo(linked.createdAt)}` : "Not connected" })
          ] })
        ] }),
        linked ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => {
          if (window.confirm(`Disconnect ${PROVIDER_LABEL[p]}?`)) void unlinkProvider(p);
        }, style: { border: "1px solid #d4d4d8", borderRadius: radius, padding: "6px 12px", fontSize: 13, cursor: "pointer", background: "#fff" }, children: "Disconnect" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => p === "github" ? client?.auth.signInWithGitHub() : client?.auth.signInWithGoogle(), style: { border: "1px solid #d4d4d8", borderRadius: radius, padding: "6px 12px", fontSize: 13, cursor: "pointer", background: "#fff" }, children: "Connect" })
      ] }, p);
    }) }) }),
    m.emailPassword && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Section, { title: u.hasPassword ? "Change password" : "Set a password", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: stack2, children: [
      u.hasPassword && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Input, { type: "password", value: pwd.current, onChange: (v) => setPwd({ ...pwd, current: v }), placeholder: "Current password", autoComplete: "current-password", radius }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Input, { type: "password", value: pwd.next, onChange: (v) => setPwd({ ...pwd, next: v }), placeholder: "New password (min 8)", autoComplete: "new-password", radius }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Input, { type: "password", value: pwd.confirm, onChange: (v) => setPwd({ ...pwd, confirm: v }), placeholder: "Confirm new password", autoComplete: "new-password", radius }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { variant: "primary", primary, radius, disabled: busy === "pwd", onClick: submitPassword, children: busy === "pwd" ? "Saving\u2026" : u.hasPassword ? "Update password" : "Set password" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { margin: 0, fontSize: 12, color: "#a1a1aa" }, children: "Updating your password signs out all other devices." }),
      pwdMsg && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: { margin: 0, fontSize: 13, color: "#3f3f46" }, children: pwdMsg })
    ] }) }),
    m.twoFactor && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Section, { title: "Two-factor authentication", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      TwoFactorSection,
      {
        client,
        enabled: u.twoFactorEnabled,
        primary,
        radius,
        onChange: refresh
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Section, { title: `Active sessions (${profile.sessions.length})`, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: stack2, children: [
      profile.sessions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", border: "1px solid #f4f4f5", borderRadius: radius, padding: "12px", fontSize: 13 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: "10px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 18 }, children: deviceIcon(s.deviceType) }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontWeight: 600, color: "#18181b" }, children: [s.os, s.browser].filter(Boolean).join(" ") || "Unknown device" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { color: "#71717a" }, children: [s.city, s.country].filter(Boolean).join(", ") || s.ipAddress || "" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { color: "#71717a" }, children: [
              "Signed in via ",
              METHOD_LABEL[s.signInMethod] ?? s.signInMethod,
              " \xB7 last active ",
              timeAgo(s.lastUsedAt)
            ] })
          ] })
        ] }),
        s.isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { fontSize: 11, fontWeight: 700, color: "#16a34a" }, children: "Current \u2713" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => void revoke(s.id), style: { border: `1px solid ${danger}`, color: danger, borderRadius: radius, padding: "6px 12px", fontSize: 13, cursor: "pointer", background: "#fff" }, children: "Revoke" })
      ] }, s.id)),
      profile.sessions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Button, { variant: "outline", primary, radius, disabled: busy === "others", onClick: signOutOthers, children: busy === "others" ? "Signing out\u2026" : "Sign out from all other devices" })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { style: { background: "#fff", border: `1px solid ${danger}33`, borderRadius: "12px", padding: "24px", fontFamily: font2 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { style: { margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: danger }, children: "Danger zone" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: stack2, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => {
          if (window.confirm("Sign out from every device, including this one?")) void signOutEverywhere();
        }, style: { alignSelf: "flex-start", border: "1px solid #d4d4d8", borderRadius: radius, padding: "8px 16px", fontSize: 14, cursor: "pointer", background: "#fff" }, children: "Sign out everywhere" }),
        !confirmDelete ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => setConfirmDelete(true), style: { alignSelf: "flex-start", border: `1px solid ${danger}`, color: danger, borderRadius: radius, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", background: "#fff" }, children: "Delete account" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { ...stack2, border: `1px solid ${danger}55`, borderRadius: radius, padding: "16px", background: `${danger}08` }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { style: { margin: 0, fontSize: 13, color: "#3f3f46" }, children: [
            "This cannot be undone. Type ",
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { children: u.email }),
            " to confirm."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Input, { type: "email", value: confirmEmail, onChange: setConfirmEmail, placeholder: u.email, radius }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ErrorText, { children: "" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: "8px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => void doDelete(), disabled: busy === "delete" || confirmEmail.trim().toLowerCase() !== u.email.toLowerCase(), style: { border: "none", background: danger, color: "#fff", borderRadius: radius, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: confirmEmail.trim().toLowerCase() !== u.email.toLowerCase() ? 0.5 : 1 }, children: busy === "delete" ? "Deleting\u2026" : "Delete my account" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => {
              setConfirmDelete(false);
              setConfirmEmail("");
            }, style: { border: "1px solid #d4d4d8", borderRadius: radius, padding: "8px 16px", fontSize: 14, cursor: "pointer", background: "#fff" }, children: "Cancel" })
          ] })
        ] })
      ] })
    ] })
  ] });
}

// src/react/user-button.tsx
var import_react7 = require("react");

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
var import_jsx_runtime5 = (
  // eslint-disable-next-line @next/next/no-img-element
  require("react/jsx-runtime")
);
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
  const [open, setOpen] = (0, import_react7.useState)(false);
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
  const avatar = user.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("img", { src: user.avatarUrl, alt: "", width: 36, height: 36, style: { borderRadius: "50%", objectFit: "cover", display: "block" } }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { width: 36, height: 36, borderRadius: "50%", background: "#18181b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }, children: initial });
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { position: "relative", display: "inline-block", fontFamily: font3 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        "aria-label": "Account",
        style: { background: "none", border: "none", padding: 0, cursor: "pointer", borderRadius: "50%", lineHeight: 0 },
        children: avatar
      }
    ),
    open && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { onClick: () => setOpen(false), style: { position: "fixed", inset: 0, zIndex: 40 } }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
        "div",
        {
          style: {
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            zIndex: 50,
            width: 240,
            background: "#fff",
            border: "1px solid #e4e4e7",
            borderRadius: `calc(${radius} + 4px)`,
            boxShadow: "0 12px 32px -8px rgba(0,0,0,0.22)",
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid #f4f4f5" }, children: [
              avatar,
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { minWidth: 0 }, children: [
                user.name && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 14, fontWeight: 600, color: "#18181b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: user.name }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 12, color: "#71717a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: user.email })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("a", { href: profileUrl, style: { display: "block", padding: "10px 16px", fontSize: 14, color: "#18181b", textDecoration: "none" }, children: "Manage account" }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { onClick: doSignOut, style: { display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 14, color: "#18181b", background: "none", border: "none", borderTop: "1px solid #f4f4f5", cursor: "pointer" }, children: "Sign out" })
          ]
        }
      )
    ] })
  ] });
}

// src/react/use-nomad-config.ts
var import_react8 = require("react");
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
  const [state, setState] = (0, import_react8.useState)(
    () => cached ? { projectName: cached.projectName, methods: cached.methods, loading: false, error: null } : { projectName: null, methods: null, loading: Boolean(projectId), error: clientError }
  );
  (0, import_react8.useEffect)(() => {
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
var import_react10 = require("react");

// src/events.ts
function trackClientEvent(opts) {
  if (typeof window === "undefined" || !opts.projectId) return;
  const base = opts.baseUrl ?? "https://nomad.red";
  try {
    void fetch(`${base}/api/sdk/v1/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Nomad-Project-Id": opts.projectId
      },
      body: JSON.stringify({ type: opts.type, metadata: opts.metadata }),
      keepalive: true
    }).catch(() => {
    });
  } catch {
  }
}

// src/react/magic-link-section.tsx
var import_react9 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
var stack3 = { display: "flex", flexDirection: "column", gap: "12px" };
function MagicLinkSection({
  client,
  primary,
  radius,
  redirectTo
}) {
  const [email, setEmail] = (0, import_react9.useState)("");
  const [state, setState] = (0, import_react9.useState)("idle");
  const [error, setError] = (0, import_react9.useState)("");
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
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { textAlign: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { style: { margin: "0 0 4px", fontSize: "14px", fontWeight: 600, color: "#16a34a" }, children: "\u2713 Check your inbox" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { style: { margin: "0 0 16px", fontSize: "13px", lineHeight: 1.6, color: "#71717a" }, children: [
        "We sent a magic link to ",
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("strong", { children: email }),
        ". Click it to sign in."
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { variant: "outline", primary, radius, onClick: () => void send(), children: "Resend link" })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("form", { onSubmit, style: stack3, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { type: "submit", variant: "primary", primary, radius, disabled: state === "sending", children: state === "sending" ? "Sending\u2026" : "Send magic link" }),
    state === "error" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ErrorText, { children: error })
  ] });
}
function MagicLinkInlineLink({
  client,
  email,
  redirectTo
}) {
  const [state, setState] = (0, import_react9.useState)("idle");
  const [error, setError] = (0, import_react9.useState)("");
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
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { style: { margin: "12px 0 0", textAlign: "center", fontSize: "13px", color: "#16a34a" }, children: [
      "\u2713 Magic link sent to ",
      email
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "button",
      {
        type: "button",
        onClick: () => void send(),
        disabled: state === "sending",
        style: {
          margin: "12px 0 0",
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          fontSize: "13px",
          color: "#71717a",
          textAlign: "center",
          cursor: state === "sending" ? "default" : "pointer"
        },
        children: state === "sending" ? "Sending\u2026" : "Email me a magic sign-in link instead"
      }
    ),
    state === "error" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ErrorText, { children: error })
  ] });
}

// src/react/sign-in.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var stack4 = { display: "flex", flexDirection: "column", gap: "14px" };
var fieldGap = { display: "flex", flexDirection: "column", gap: "12px" };
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
  (0, import_react10.useEffect)(() => {
    if (resolvedProjectId)
      trackClientEvent({
        projectId: resolvedProjectId,
        baseUrl: resolvedBaseUrl,
        type: "signin_viewed"
      });
  }, [resolvedProjectId, resolvedBaseUrl]);
  const [email, setEmail] = (0, import_react10.useState)("");
  const [password, setPassword] = (0, import_react10.useState)("");
  const [busy, setBusy] = (0, import_react10.useState)(null);
  const [formError, setFormError] = (0, import_react10.useState)("");
  const [challenge, setChallenge] = (0, import_react10.useState)(null);
  const [code, setCode] = (0, import_react10.useState)("");
  if (clientError) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CenterMessage, { tone: "error", title: "Configuration error", body: `NomadSignIn: ${clientError}` }) });
  }
  if (loading || !methods) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CenterMessage, { tone: configError ? "error" : "muted", body: configError ?? "Loading\u2026" }) });
  }
  if (!methods.emailPassword && !methods.google && !methods.github && !methods.magicLinks) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CenterMessage, { tone: "error", title: "Sign-in unavailable", body: "No sign-in methods enabled. Contact the administrator." }) });
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
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Card, { radius, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(BrandMark, { name: projectName ?? void 0 }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Title, { children: "Two-step verification" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Subtitle, { children: "Enter the code from your authenticator app" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("form", { onSubmit: onVerify, style: stack4, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Label, { children: "Verification code" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Button, { type: "submit", variant: "primary", primary, radius, disabled: busy === "2fa", children: busy === "2fa" ? "Verifying\u2026" : "Verify" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(ErrorText, { children: formError }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: { margin: 0, fontSize: 12, textAlign: "center", color: "#a1a1aa" }, children: "You can also enter one of your backup codes." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(SecuredByNomad, {})
    ] }) });
  }
  const showOAuth = methods.google || methods.github;
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Card, { radius, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(BrandMark, { name: projectName ?? void 0 }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Title, { children: [
      "Sign in",
      projectName ? ` to ${projectName}` : ""
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Subtitle, { children: "Welcome back! Please sign in to continue" }),
    showOAuth && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: fieldGap, children: [
      methods.google && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Button, { variant: "outline", radius, primary, disabled: busy !== null, onClick: () => {
        setBusy("google");
        client?.auth.signInWithGoogle();
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(GoogleIcon, {}),
        " Continue with Google"
      ] }),
      methods.github && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Button, { variant: "outline", radius, primary, disabled: busy !== null, onClick: () => {
        setBusy("github");
        client?.auth.signInWithGitHub();
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(GitHubIcon, {}),
        " Continue with GitHub"
      ] })
    ] }),
    showOAuth && (methods.emailPassword || methods.magicLinks) && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Separator, {}),
    methods.emailPassword ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("form", { onSubmit, style: stack4, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Label, { children: "Email address" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Input, { type: "email", value: email, onChange: setEmail, placeholder: "you@example.com", autoComplete: "email", radius, disabled: busy !== null })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Label, { children: "Password" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Input, { type: "password", value: password, onChange: setPassword, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete: "current-password", radius, disabled: busy !== null }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { marginTop: 6 }, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("a", { href: "/reset-password", style: { fontSize: "12px", color: "#71717a", textDecoration: "underline" }, children: "Forgot password?" }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Button, { type: "submit", variant: "primary", radius, primary, disabled: busy !== null, children: busy === "email" ? "Signing in\u2026" : "Continue" })
      ] }),
      methods.magicLinks && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(MagicLinkInlineLink, { client, email })
    ] }) : methods.magicLinks && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(MagicLinkSection, { client, primary, radius }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(ErrorText, { children: formError }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Footer, { children: [
      "Don't have an account? ",
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(MutedLink, { href: signUpUrl, children: "Sign up" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(SecuredByNomad, {})
  ] }) });
}

// src/react/sign-up.tsx
var import_react11 = require("react");
var import_jsx_runtime8 = require("react/jsx-runtime");
var stack5 = { display: "flex", flexDirection: "column", gap: "14px" };
var fieldGap2 = { display: "flex", flexDirection: "column", gap: "12px" };
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
  (0, import_react11.useEffect)(() => {
    if (resolvedProjectId)
      trackClientEvent({
        projectId: resolvedProjectId,
        baseUrl: resolvedBaseUrl,
        type: "signup_viewed"
      });
  }, [resolvedProjectId, resolvedBaseUrl]);
  const [name, setName] = (0, import_react11.useState)("");
  const [email, setEmail] = (0, import_react11.useState)("");
  const [password, setPassword] = (0, import_react11.useState)("");
  const [busy, setBusy] = (0, import_react11.useState)(null);
  const [formError, setFormError] = (0, import_react11.useState)("");
  if (clientError) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(CenterMessage, { tone: "error", title: "Configuration error", body: `NomadSignUp: ${clientError}` }) });
  }
  if (loading || !methods) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(CenterMessage, { tone: configError ? "error" : "muted", body: configError ?? "Loading\u2026" }) });
  }
  if (!methods.emailPassword && !methods.google && !methods.github && !methods.magicLinks) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(CenterMessage, { tone: "error", title: "Sign-up unavailable", body: "No sign-in methods enabled. Contact the administrator." }) });
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
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Card, { radius, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(BrandMark, { name: projectName ?? void 0 }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Title, { children: "Create your account" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Subtitle, { children: [
      "Welcome! Please fill in the details to get started",
      projectName ? ` with ${projectName}` : "",
      "."
    ] }),
    showOAuth && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: fieldGap2, children: [
      methods.google && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Button, { variant: "outline", radius, primary, disabled: busy !== null, onClick: () => {
        setBusy("google");
        client?.auth.signInWithGoogle();
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(GoogleIcon, {}),
        " Continue with Google"
      ] }),
      methods.github && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Button, { variant: "outline", radius, primary, disabled: busy !== null, onClick: () => {
        setBusy("github");
        client?.auth.signInWithGitHub();
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(GitHubIcon, {}),
        " Continue with GitHub"
      ] })
    ] }),
    showOAuth && (methods.emailPassword || methods.magicLinks) && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Separator, {}),
    methods.emailPassword ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("form", { onSubmit, style: stack5, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Label, { children: "Name (optional)" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Input, { type: "text", value: name, onChange: setName, placeholder: "Your name", autoComplete: "name", radius, disabled: busy !== null })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Label, { children: "Email address" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Input, { type: "email", value: email, onChange: setEmail, placeholder: "you@example.com", autoComplete: "email", radius, disabled: busy !== null })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Label, { children: "Password" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Input, { type: "password", value: password, onChange: setPassword, placeholder: "At least 8 characters", autoComplete: "new-password", radius, disabled: busy !== null })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { type: "submit", variant: "primary", radius, primary, disabled: busy !== null, children: busy === "email" ? "Creating account\u2026" : "Continue" })
      ] }),
      methods.magicLinks && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(MagicLinkInlineLink, { client, email })
    ] }) : methods.magicLinks && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(MagicLinkSection, { client, primary, radius }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ErrorText, { children: formError }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(Footer, { children: [
      "Already have an account? ",
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(MutedLink, { href: signInUrl, children: "Sign in" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SecuredByNomad, {})
  ] }) });
}

// src/react/verify-email.tsx
var import_react12 = require("react");
var import_jsx_runtime9 = require("react/jsx-runtime");
function NomadVerifyEmail({
  projectId,
  baseUrl,
  afterVerifyUrl = "/app",
  appearance
}) {
  const { client, error: clientError } = useNomadClient({ projectId, baseUrl });
  const { primary, radius } = resolveAppearance(appearance);
  const [email, setEmail] = (0, import_react12.useState)(null);
  const [checking, setChecking] = (0, import_react12.useState)(true);
  const [resending, setResending] = (0, import_react12.useState)(false);
  const [message, setMessage] = (0, import_react12.useState)("");
  (0, import_react12.useEffect)(() => {
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
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CenterMessage, { tone: "error", title: "Configuration error", body: `NomadVerifyEmail: ${clientError}` }) });
  }
  if (checking || !email) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CenterMessage, { body: "Loading\u2026" }) });
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
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(Card, { radius, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Title, { children: "Verify your email" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("p", { style: { textAlign: "center", color: "#52525b", fontSize: "14px", lineHeight: 1.6, margin: "0 0 24px" }, children: [
      "We sent a verification link to ",
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { children: email }),
      ". Click the link in the email to access your account."
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { variant: "primary", primary, radius, disabled: resending, onClick: resend, children: resending ? "Sending\u2026" : "Resend verification email" }),
    message && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { style: { textAlign: "center", fontSize: "13px", color: "#71717a", marginTop: "12px" }, children: message }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("p", { style: { textAlign: "center", fontSize: "13px", color: "#a1a1aa", marginTop: "24px" }, children: [
      "Wrong email?",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { onClick: signOut, style: { color: "#18181b", textDecoration: "underline", cursor: "pointer" }, children: "Sign out" })
    ] })
  ] }) });
}

// src/react/oauth-callback.tsx
var import_react13 = require("react");
var import_jsx_runtime10 = require("react/jsx-runtime");
function NomadOAuthCallback({
  projectId,
  baseUrl,
  afterCallbackUrl = "/app"
}) {
  const { client, error: clientError } = useNomadClient({ projectId, baseUrl });
  const [status, setStatus] = (0, import_react13.useState)("loading");
  const [errorMsg, setErrorMsg] = (0, import_react13.useState)("");
  (0, import_react13.useEffect)(() => {
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
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(CenterMessage, { tone: "error", title: "Configuration error", body: `NomadOAuthCallback: ${clientError}` }) });
  }
  if (status === "error") {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(CenterMessage, { tone: "error", body: errorMsg }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(CenterMessage, { tone: "success", body: "Signing you in\u2026" }) });
}

// src/react/pricing.tsx
var import_react14 = require("react");
var import_jsx_runtime11 = require("react/jsx-runtime");
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
  const [plans, setPlans] = (0, import_react14.useState)(null);
  const [error, setError] = (0, import_react14.useState)(clientError);
  const [comingSoon, setComingSoon] = (0, import_react14.useState)(false);
  const [busyId, setBusyId] = (0, import_react14.useState)(null);
  const [notice, setNotice] = (0, import_react14.useState)(null);
  (0, import_react14.useEffect)(() => {
    if (projectId)
      trackClientEvent({ projectId, baseUrl, type: "pricing_viewed" });
  }, [projectId, baseUrl]);
  (0, import_react14.useEffect)(() => {
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
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("p", { style: { fontFamily: font4, color: "#b91c1c" }, children: [
      "Could not load pricing: ",
      error
    ] });
  }
  if (!plans) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { style: { fontFamily: font4, color: "#71717a" }, children: "Loading plans\u2026" });
  }
  if (plans.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { style: { fontFamily: font4, color: "#71717a" }, children: "No plans available yet." });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { fontFamily: font4, color: "#18181b" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      "div",
      {
        style: {
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
        },
        children: plans.map((plan) => {
          const popular = plan.isMostPopular;
          return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
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
                popular && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
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
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h3", { style: { margin: 0, fontSize: "18px", fontWeight: 600 }, children: plan.name }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { marginTop: "8px", display: "flex", alignItems: "baseline", gap: "4px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { fontSize: "30px", fontWeight: 700 }, children: money(plan.priceMonthlyCents, plan.currency) }),
                  plan.priceMonthlyCents ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { color: "#71717a", fontSize: "14px" }, children: "/mo" }) : null
                ] }),
                plan.priceYearlyCents ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("p", { style: { margin: "4px 0 0", color: "#71717a", fontSize: "13px" }, children: [
                  "or ",
                  money(plan.priceYearlyCents, plan.currency),
                  "/yr"
                ] }) : null,
                plan.description && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { style: { margin: "12px 0 0", color: "#52525b", fontSize: "14px" }, children: plan.description }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("ul", { style: { listStyle: "none", padding: 0, margin: "16px 0", flex: 1 }, children: plan.features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
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
                      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { color: primary, fontWeight: 700 }, children: "\u2713" }),
                      f
                    ]
                  },
                  f
                )) }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
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
    notice && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
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
    comingSoon && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
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
        children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
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
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h3", { style: { margin: 0, fontSize: "18px", fontWeight: 600 }, children: "Coming soon" }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { style: { margin: "10px 0 20px", color: "#52525b", fontSize: "14px" }, children: "Payment processing is not yet enabled for this app. The creator is setting up payments \u2014 check back shortly." }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
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
var import_react15 = require("react");

// src/preview.ts
var PREVIEW_NOMAD_HOST = /^preview-.+\.nomad\.red$/i;
var PREVIEW_ONRENDER_HOST = /-preview\.onrender\.com$/i;
function previewEnvFlag() {
  const g = globalThis;
  return g.process?.env?.NEXT_PUBLIC_NOMAD_PREVIEW_MODE === "true";
}
function isPreviewMode() {
  if (typeof window === "undefined") return previewEnvFlag();
  const w = window;
  if (w.__NOMAD_PREVIEW_MODE__ === true) return true;
  if (previewEnvFlag()) return true;
  const host = window.location.hostname.toLowerCase();
  return PREVIEW_NOMAD_HOST.test(host) || PREVIEW_ONRENDER_HOST.test(host);
}
function getProductionUrl() {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (PREVIEW_NOMAD_HOST.test(host)) {
    return `https://${host.replace(/^preview-/i, "")}`;
  }
  return null;
}
function hasNomadToken() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith("nomad_token="));
}
function setNomadTokenCookie(token) {
  if (typeof document === "undefined") return;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
  document.cookie = `nomad_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${secure}`;
}
async function skipLoginAsTestUser(opts) {
  if (!isPreviewMode()) {
    throw new Error("Skip login is only available in preview mode");
  }
  const base = opts.baseUrl ?? "https://nomad.red";
  const res = await fetch(`${base}/api/sdk/v1/preview/skip-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Nomad-Project-Id": opts.projectId
    },
    body: JSON.stringify({ projectId: opts.projectId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Skip login failed");
  }
  const data = await res.json();
  setNomadTokenCookie(data.token);
  if (typeof window !== "undefined") window.location.reload();
}

// src/react/preview-banner.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
function NomadPreviewBanner({
  projectId: projectIdProp,
  baseUrl: baseUrlProp,
  forceVisible,
  autoLogin = true,
  appearance
} = {}) {
  const [dismissed, setDismissed] = (0, import_react15.useState)(false);
  const [error, setError] = (0, import_react15.useState)(null);
  const autoRef = (0, import_react15.useRef)(false);
  const override = projectIdProp || baseUrlProp ? { projectId: projectIdProp, baseUrl: baseUrlProp } : void 0;
  const { user, loading, signOut } = useNomadAuth(override);
  const { projectId, baseUrl } = useNomadClient(override);
  const previewMode = forceVisible || isPreviewMode();
  (0, import_react15.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
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
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { fontSize: 14 }, children: "\u{1F527}" }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("strong", { children: "Preview Mode" }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { style: { opacity: 0.6 }, children: [
            "\u2014 ",
            status
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
          isTestUser && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
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
          productionUrl && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
