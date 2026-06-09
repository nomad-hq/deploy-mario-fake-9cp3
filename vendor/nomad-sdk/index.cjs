"use strict";
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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  NomadError: () => NomadError,
  createNomadClient: () => createNomadClient,
  getProductionUrl: () => getProductionUrl,
  isPreviewMode: () => isPreviewMode,
  nomad: () => nomad,
  skipLoginAsTestUser: () => skipLoginAsTestUser
});
module.exports = __toCommonJS(index_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NomadError,
  createNomadClient,
  getProductionUrl,
  isPreviewMode,
  nomad,
  skipLoginAsTestUser
});
