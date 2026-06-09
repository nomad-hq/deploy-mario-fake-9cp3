import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { N as NomadUser, i as NomadSession, P as Profile, U as UpdateProfileInput, C as ChangePasswordInput } from '../types-VnL3gkTJ.js';

declare function NomadProvider({ projectId, baseUrl, children, }: {
    projectId: string;
    baseUrl?: string;
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;
interface ClientOverride {
    projectId?: string;
    baseUrl?: string;
}

interface UseNomadAuthResult {
    user: NomadUser | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    signOut: () => Promise<void>;
}
/** Current end-user state, auto-fetched on mount + refreshed on cross-tab changes. */
declare function useNomadAuth(override?: ClientOverride): UseNomadAuthResult;

interface UseNomadSessionsResult {
    sessions: NomadSession[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    revoke: (sessionId: string) => Promise<void>;
    revokeAllOthers: () => Promise<void>;
}
/** The signed-in user's active device sessions, with revoke helpers. */
declare function useNomadSessions(override?: ClientOverride): UseNomadSessionsResult;

interface UseNomadProfileResult {
    profile: Profile | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    update: (input: UpdateProfileInput) => Promise<void>;
    changePassword: (input: ChangePasswordInput) => Promise<{
        success: boolean;
        revokedSessionsCount: number;
    }>;
    unlinkProvider: (provider: "google" | "github") => Promise<void>;
    deleteAccount: (confirmEmail: string) => Promise<void>;
}
/** The signed-in user's full profile, with mutation helpers (auto-refresh). */
declare function useNomadProfile(override?: ClientOverride): UseNomadProfileResult;

interface Appearance {
    primaryColor?: string;
    borderRadius?: string;
}

interface NomadUserProfileProps extends ClientOverride {
    afterDeleteUrl?: string;
    appearance?: Appearance & {
        dangerColor?: string;
    };
}
declare function NomadUserProfile({ afterDeleteUrl, appearance, projectId, baseUrl, }: NomadUserProfileProps): react_jsx_runtime.JSX.Element;

interface NomadUserButtonProps extends ClientOverride {
    profileUrl?: string;
    afterSignOutUrl?: string;
    appearance?: Appearance;
}
/** Clerk-style avatar button with a dropdown (manage account + sign out). */
declare function NomadUserButton({ profileUrl, afterSignOutUrl, projectId, baseUrl, appearance, }: NomadUserButtonProps): react_jsx_runtime.JSX.Element | null;

interface AuthMethodsConfig {
    emailPassword: boolean;
    google: boolean;
    github: boolean;
    magicLinks: boolean;
    twoFactor: boolean;
}
interface UseNomadConfigResult {
    projectName: string | null;
    methods: AuthMethodsConfig | null;
    loading: boolean;
    error: string | null;
}
/** Fetch a project's enabled auth methods (SWR-style: cache + revalidate). */
declare function useNomadConfig(override?: ClientOverride): UseNomadConfigResult;

interface NomadSignInProps {
    projectId?: string;
    baseUrl?: string;
    signUpUrl?: string;
    afterSignInUrl?: string;
    appearance?: Appearance;
}
declare function NomadSignIn({ projectId, baseUrl, signUpUrl, afterSignInUrl, appearance, }: NomadSignInProps): react_jsx_runtime.JSX.Element;

interface NomadSignUpProps {
    projectId?: string;
    baseUrl?: string;
    signInUrl?: string;
    afterSignUpUrl?: string;
    appearance?: Appearance;
}
declare function NomadSignUp({ projectId, baseUrl, signInUrl, afterSignUpUrl, appearance, }: NomadSignUpProps): react_jsx_runtime.JSX.Element;

interface NomadVerifyEmailProps {
    projectId?: string;
    baseUrl?: string;
    afterVerifyUrl?: string;
    appearance?: Appearance;
}
declare function NomadVerifyEmail({ projectId, baseUrl, afterVerifyUrl, appearance, }: NomadVerifyEmailProps): react_jsx_runtime.JSX.Element;

interface NomadOAuthCallbackProps {
    projectId?: string;
    baseUrl?: string;
    afterCallbackUrl?: string;
}
declare function NomadOAuthCallback({ projectId, baseUrl, afterCallbackUrl, }: NomadOAuthCallbackProps): react_jsx_runtime.JSX.Element;

interface NomadPlan {
    id: string;
    name: string;
    description: string | null;
    priceMonthlyCents: number | null;
    priceYearlyCents: number | null;
    currency: string;
    features: string[];
    isMostPopular: boolean;
}
interface NomadPricingProps extends ClientOverride {
    appearance?: Appearance;
    /**
     * Called when a plan is chosen. If omitted, a paid plan starts Stripe Checkout
     * automatically (the buyer must be signed in via the Nomad SDK first).
     */
    onPlanSelect?: (plan: NomadPlan) => void;
    /** Billing cycle to check out with (default "monthly"). */
    billingCycle?: "monthly" | "yearly";
    /** Where Stripe returns the buyer after a successful payment. */
    successUrl?: string;
    cancelUrl?: string;
}
/**
 * Drop-in pricing grid for a creator's SaaS. Fetches the creator's public plans
 * and renders them. Selecting a plan calls `onPlanSelect`, or shows a "coming
 * soon" notice until Stripe Connect checkout is enabled.
 */
declare function NomadPricing({ projectId: projectIdProp, baseUrl: baseUrlProp, appearance, onPlanSelect, billingCycle, successUrl, cancelUrl, }: NomadPricingProps): react_jsx_runtime.JSX.Element;

interface NomadPreviewBannerProps {
    /** Project id (or rely on a surrounding <NomadProvider>). */
    projectId?: string;
    baseUrl?: string;
    /** Force visibility (default: auto-detect via isPreviewMode()). */
    forceVisible?: boolean;
    appearance?: {
        background?: string;
        textColor?: string;
        accentColor?: string;
    };
}
/**
 * Sticky "Preview Mode" banner with a one-click "Skip login as test user".
 * Renders ONLY on a Nomad preview deployment — never in production.
 */
declare function NomadPreviewBanner({ projectId: projectIdProp, baseUrl: baseUrlProp, forceVisible, appearance, }?: NomadPreviewBannerProps): react_jsx_runtime.JSX.Element | null;

export { type Appearance, type AuthMethodsConfig, type ClientOverride, NomadOAuthCallback, type NomadOAuthCallbackProps, type NomadPlan, NomadPreviewBanner, type NomadPreviewBannerProps, NomadPricing, type NomadPricingProps, NomadProvider, NomadSignIn, type NomadSignInProps, NomadSignUp, type NomadSignUpProps, NomadUserButton, type NomadUserButtonProps, NomadUserProfile, type NomadUserProfileProps, NomadVerifyEmail, type NomadVerifyEmailProps, type UseNomadAuthResult, type UseNomadConfigResult, type UseNomadProfileResult, type UseNomadSessionsResult, useNomadAuth, useNomadConfig, useNomadProfile, useNomadSessions };
