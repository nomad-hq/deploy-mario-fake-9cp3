import { S as SignUpInput, A as AuthResponse, a as SignInInput, T as TwoFactorChallenge, b as TwoFactorSetup, c as TwoFactorEnableResult, d as SuccessResponse, V as Verify2FAInput, N as NomadUser, e as SendEmailVerificationInput, R as ResendVerificationInput, f as RequestPasswordResetInput, g as ResetPasswordInput, h as ResetPasswordResponse, O as OAuthSignInOptions, M as MagicLinkInput, i as NomadSession, P as Profile, U as UpdateProfileInput, C as ChangePasswordInput, D as DeleteAccountInput, j as OAuthCallbackResult, k as NomadConfig } from './types-VnL3gkTJ.js';
export { L as LinkedAccount, l as NomadStorage, m as Session } from './types-VnL3gkTJ.js';

interface AuthModule {
    signUp(input: SignUpInput): Promise<AuthResponse>;
    /**
     * Sign in. If the user has 2FA enabled, resolves to a TwoFactorChallenge
     * instead of a session — call verify2FA() with the challengeToken + code.
     */
    signIn(input: SignInInput): Promise<AuthResponse | TwoFactorChallenge>;
    /** Start TOTP setup — returns a QR code + secret to show the user. */
    setup2FA(): Promise<TwoFactorSetup>;
    /** Confirm setup with a TOTP code; returns one-time backup codes. */
    enable2FA(input: {
        code: string;
    }): Promise<TwoFactorEnableResult>;
    /** Turn off 2FA (requires a TOTP or backup code). */
    disable2FA(input: {
        code: string;
    }): Promise<SuccessResponse>;
    /** Complete a 2FA-gated sign-in with the challenge token + code. */
    verify2FA(input: Verify2FAInput): Promise<AuthResponse>;
    signOut(): Promise<void>;
    getCurrentUser(): Promise<NomadUser | null>;
    /** Cheap local check — true if a token is stored (doesn't hit the network). */
    isSignedIn(): boolean;
    /** (Re)send the email-verification link. Defaults to the signed-in user's email. */
    sendEmailVerification(input?: SendEmailVerificationInput): Promise<SuccessResponse>;
    /**
     * Resend the verification email. Like sendEmailVerification, but also works
     * for a signed-in-but-unverified user without passing an email (uses the JWT).
     */
    resendVerificationEmail(input?: ResendVerificationInput): Promise<SuccessResponse>;
    /** Trigger a password-reset email. Always resolves (never reveals existence). */
    requestPasswordReset(input: RequestPasswordResetInput): Promise<SuccessResponse>;
    /** Set a new password using a token from the reset email. */
    resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResponse>;
    /** Redirect to Google's consent screen (browser only). */
    signInWithGoogle(options?: OAuthSignInOptions): void;
    /** Redirect to GitHub's consent screen (browser only). */
    signInWithGitHub(options?: OAuthSignInOptions): void;
    /** Email a passwordless sign-in link. Doubles as sign-up for new emails. */
    signInWithMagicLink(input: MagicLinkInput): Promise<SuccessResponse>;
    /** List the signed-in user's active device sessions. */
    listSessions(): Promise<NomadSession[]>;
    /** Revoke one session (revoking the current one signs out on next refresh). */
    revokeSession(sessionId: string): Promise<SuccessResponse>;
    /** Revoke every session except the current one ("sign out everywhere else"). */
    revokeAllOtherSessions(): Promise<{
        revokedCount: number;
    }>;
    /** Revoke every session (including this device) and clear the local session. */
    signOutEverywhere(): Promise<{
        revokedCount: number;
    }>;
    /** Full profile (user, linked accounts, sessions, enabled methods). */
    getProfile(): Promise<Profile>;
    /** Update name / avatar; returns the refreshed profile. */
    updateProfile(input: UpdateProfileInput): Promise<Profile>;
    /** Change (or, for OAuth-only users, set) the password; revokes other sessions. */
    changePassword(input: ChangePasswordInput): Promise<{
        success: boolean;
        revokedSessionsCount: number;
    }>;
    /** Disconnect a linked OAuth account; returns the refreshed profile. */
    unlinkProvider(input: {
        provider: "google" | "github";
    }): Promise<Profile>;
    /** Soft-delete the account (requires email confirmation) + clear local session. */
    deleteAccount(input: DeleteAccountInput): Promise<SuccessResponse>;
    /**
     * Call on the /oauth-callback page: reads ?nomad_token from the URL, stores the
     * session, cleans the URL, and returns the token (or null if absent).
     */
    handleOAuthCallback(): OAuthCallbackResult;
}

interface CheckoutInput {
    /** The creator plan to subscribe to (id from NomadPricing / the plans API). */
    planId: string;
    billingCycle?: "monthly" | "yearly";
    /** Where Stripe returns the buyer on success. Defaults to the current URL. */
    successUrl?: string;
    /** Where Stripe returns the buyer on cancel. Defaults to successUrl. */
    cancelUrl?: string;
    /** Redirect the browser to Stripe automatically (default true). */
    redirect?: boolean;
}
interface PaymentsModule {
    /**
     * Start a Stripe Checkout for the signed-in end_user. Returns the Checkout
     * URL and (by default) redirects the browser there.
     */
    checkout(input: CheckoutInput): Promise<{
        url: string;
    }>;
}

interface NomadClient {
    projectId: string;
    auth: AuthModule;
    payments: PaymentsModule;
}
declare function createNomadClient(config: NomadConfig): NomadClient;
declare const nomad: NomadClient;

type NomadErrorCode = "INVALID_CREDENTIALS" | "EMAIL_ALREADY_EXISTS" | "PROJECT_NOT_FOUND" | "NETWORK_ERROR" | "UNAUTHORIZED" | "INVALID_INPUT" | "UNKNOWN";
declare class NomadError extends Error {
    code: NomadErrorCode;
    status?: number;
    details?: unknown;
    constructor(message: string, code: NomadErrorCode, status?: number, details?: unknown);
}

/**
 * Preview-mode helpers. Nomad serves a SaaS's preview deployment from a
 * dedicated host (preview-<slug>.nomad.red or <svc>-preview.onrender.com) and
 * injects NEXT_PUBLIC_NOMAD_PREVIEW_MODE=true on those services only. Either
 * signal flips preview mode on; production never matches, so the preview banner
 * can NEVER appear in production.
 */
/** Is the current SaaS running on a Nomad PREVIEW deployment? */
declare function isPreviewMode(): boolean;
/** The production URL for this SaaS, derived from a preview-*.nomad.red host. */
declare function getProductionUrl(): string | null;
/** Whether a Nomad session cookie is already present (avoids auto-login loops). */
declare function hasNomadToken(): boolean;
/**
 * Log in as the project's preview test user (preview mode only). On success the
 * session token is written to the nomad_token cookie and the page reloads.
 */
declare function skipLoginAsTestUser(opts: {
    projectId: string;
    baseUrl?: string;
}): Promise<void>;

/**
 * Client-side analytics beacon. Fires a lightweight event to Nomad (view/click)
 * — the creator's app calls nothing; the Nomad components fire these for it.
 * Fire-and-forget, never throws, survives navigation (keepalive).
 */
declare function trackClientEvent(opts: {
    projectId: string;
    baseUrl?: string;
    type: "signin_viewed" | "signup_viewed" | "pricing_viewed" | "plan_selected" | "product_viewed" | "product_clicked";
    metadata?: Record<string, unknown>;
}): void;

export { type AuthModule, AuthResponse, ChangePasswordInput, DeleteAccountInput, MagicLinkInput, type NomadClient, NomadConfig, NomadError, type NomadErrorCode, NomadSession, NomadUser, OAuthCallbackResult, OAuthSignInOptions, Profile, RequestPasswordResetInput, ResendVerificationInput, ResetPasswordInput, ResetPasswordResponse, SendEmailVerificationInput, SignInInput, SignUpInput, SuccessResponse, TwoFactorChallenge, TwoFactorEnableResult, TwoFactorSetup, UpdateProfileInput, Verify2FAInput, createNomadClient, getProductionUrl, hasNomadToken, isPreviewMode, nomad, skipLoginAsTestUser, trackClientEvent };
