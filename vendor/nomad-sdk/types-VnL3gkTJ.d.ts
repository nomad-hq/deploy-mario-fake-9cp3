interface NomadUser {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    metadata: Record<string, unknown>;
    emailVerified: boolean;
    /** True for the throwaway test user created by preview "Skip login". */
    isPreviewTestUser?: boolean;
    createdAt: string;
    lastSignInAt: string | null;
}
interface AuthResponse {
    user: NomadUser;
    token: string;
}
interface Session {
    token: string;
    /** Optional: an OAuth callback stores the token before the user is fetched. */
    user?: NomadUser;
}
interface OAuthSignInOptions {
    /** Where the provider sends the user back. Defaults to <origin>/oauth-callback. */
    redirectTo?: string;
}
interface OAuthCallbackResult {
    token: string | null;
}
interface NomadStorage {
    getSession(): Session | null;
    setSession(session: Session): void;
    clearSession(): void;
}
interface NomadConfig {
    projectId: string;
    /** Defaults to https://nomad.red */
    baseUrl?: string;
    /** Override the token store (defaults to localStorage in browser, memory in Node). */
    storage?: NomadStorage;
}
interface SignUpInput {
    email: string;
    password: string;
    name?: string;
    metadata?: Record<string, unknown>;
}
interface SignInInput {
    email: string;
    password: string;
}
interface SendEmailVerificationInput {
    /** Defaults to the currently signed-in user's email. */
    email?: string;
}
interface ResendVerificationInput {
    /** Defaults to the currently signed-in user's email. */
    email?: string;
}
interface RequestPasswordResetInput {
    email: string;
}
interface ResetPasswordInput {
    token: string;
    newPassword: string;
}
interface MagicLinkInput {
    email: string;
    /** Where to send the user back after they click the link in their email. */
    redirectTo?: string;
}
interface LinkedAccount {
    id: string;
    provider: string;
    providerEmail: string | null;
    providerName: string | null;
    providerAvatarUrl: string | null;
    createdAt: string;
}
interface Profile {
    user: {
        id: string;
        email: string;
        emailVerified: boolean;
        name: string | null;
        avatarUrl: string | null;
        hasPassword: boolean;
        twoFactorEnabled: boolean;
        createdAt: string;
        updatedAt: string;
    };
    linkedAccounts: LinkedAccount[];
    sessions: NomadSession[];
    methods: {
        emailPassword: boolean;
        google: boolean;
        github: boolean;
        magicLinks: boolean;
        twoFactor: boolean;
    };
}
interface TwoFactorChallenge {
    twoFactorRequired: true;
    challengeToken: string;
}
interface TwoFactorSetup {
    secret: string;
    otpauthUri: string;
    qrCode: string;
}
interface TwoFactorEnableResult {
    success: boolean;
    backupCodes: string[];
}
interface Verify2FAInput {
    challengeToken: string;
    code: string;
}
interface UpdateProfileInput {
    name?: string;
    avatarUrl?: string;
}
interface ChangePasswordInput {
    currentPassword?: string;
    newPassword: string;
}
interface DeleteAccountInput {
    confirmEmail: string;
}
/** An active device session (Clerk-style "Devices"). Named NomadSession to avoid
 *  clashing with the local storage `Session`. */
interface NomadSession {
    id: string;
    createdAt: string;
    lastUsedAt: string;
    expiresAt: string;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
    ipAddress: string | null;
    country: string | null;
    city: string | null;
    signInMethod: "email_password" | "google" | "github" | "magic_link";
    isCurrent: boolean;
}
/** Generic success ack (send-verification / request-password-reset). */
interface SuccessResponse {
    success: boolean;
}
/** reset-password also returns the updated user. */
interface ResetPasswordResponse {
    success: boolean;
    user: NomadUser;
}

export type { AuthResponse as A, ChangePasswordInput as C, DeleteAccountInput as D, LinkedAccount as L, MagicLinkInput as M, NomadUser as N, OAuthSignInOptions as O, Profile as P, ResendVerificationInput as R, SignUpInput as S, TwoFactorChallenge as T, UpdateProfileInput as U, Verify2FAInput as V, SignInInput as a, TwoFactorSetup as b, TwoFactorEnableResult as c, SuccessResponse as d, SendEmailVerificationInput as e, RequestPasswordResetInput as f, ResetPasswordInput as g, ResetPasswordResponse as h, NomadSession as i, OAuthCallbackResult as j, NomadConfig as k, NomadStorage as l, Session as m };
