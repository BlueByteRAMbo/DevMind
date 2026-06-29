// ============================================================
// DevMind — App.tsx
// Root component: auth gate → three-column layout (desktop)
//                            or bottom tab bar (mobile)
// ============================================================

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAppStore } from "../store/appStore";
import { useSync } from "../hooks/useSync";
import { TopicSidebar } from "../components/sidebar/TopicSidebar";
import { TopicPage } from "./TopicPage";
import { SearchPage } from "./SearchPage";
import { Logo } from "../components/ui/Logo";
import { Spinner } from "../components/ui/Spinner";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

// ── Auth Screen ───────────────────────────────────────────────
const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-dvh bg-bg-base flex flex-col items-center justify-center p-6">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #7C6AF7, transparent)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #F0904D, transparent)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #C45EE0, transparent)" }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo + brand */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <Logo size={80} />
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              <span className="text-text-primary">Dev</span>
              <span className="text-gradient-brand">Mind</span>
            </h1>
            <p className="text-text-subtle text-sm mt-1 tracking-widest uppercase font-medium">
              Think. Learn. Build.
            </p>
          </div>
        </div>

        {/* Auth form */}
        <div className="bg-bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4">
          {sent ? (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">📬</div>
              <p className="text-text-primary font-semibold">Check your email</p>
              <p className="text-text-muted text-sm">
                We sent a magic link to <strong className="text-text-body">{email}</strong>.
                Click it to sign in.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-xs text-accent-purple hover:text-accent-purple2 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-text-primary font-semibold text-base">Sign in</h2>
                <p className="text-text-muted text-xs">
                  No password needed — we'll email you a magic link.
                </p>
              </div>

              {error && (
                <div className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <Input
                id="auth-email-input"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                autoFocus
                autoComplete="email"
              />

              <Button
                id="btn-magic-link"
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleMagicLink}
                isLoading={loading}
                disabled={!email.trim()}
              >
                Send Magic Link
              </Button>

              <div className="flex items-center gap-3">
                <span className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-muted">or</span>
                <span className="flex-1 h-px bg-border" />
              </div>

              <Button
                id="btn-google-signin"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleGoogle}
                isLoading={googleLoading}
                leftIcon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                }
              >
                Continue with Google
              </Button>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-text-muted mt-6">
          Local-first · Works offline · Free forever
        </p>
      </div>
    </div>
  );
};

// ── Settings mini-page (inline) ───────────────────────────────
const SettingsPage: React.FC = () => {
  const user = useAppStore((s) => s.user);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <h1 className="text-text-primary text-lg font-semibold">Settings</h1>

      {/* Account */}
      <section className="bg-bg-card border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Account</h2>
        <p className="text-sm text-text-body">{user?.email}</p>
        <Button
          id="btn-sign-out"
          variant="danger"
          size="sm"
          onClick={handleSignOut}
          isLoading={signingOut}
        >
          Sign Out
        </Button>
      </section>

      {/* AI Provider */}
      <section className="bg-bg-card border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">AI Provider</h2>
        <p className="text-xs text-text-muted">
          DevMind uses Gemini 2.0 Flash by default (free, 1M tokens/day). You can add a Claude API key for optional use.
        </p>
        <Input
          id="settings-claude-key"
          type="password"
          label="Claude API Key (optional)"
          placeholder="sk-ant-..."
          onChange={(e) => {
            try {
              const s = JSON.parse(localStorage.getItem("devmind_settings") || "{}");
              s.claudeApiKey = e.target.value;
              localStorage.setItem("devmind_settings", JSON.stringify(s));
            } catch {}
          }}
        />
        <p className="text-[11px] text-text-muted">
          Stored in memory only — never synced to the cloud.
        </p>
      </section>

      {/* About */}
      <section className="bg-bg-card border border-border rounded-xl p-4 space-y-2">
        <h2 className="text-sm font-semibold text-text-primary">About DevMind</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          DevMind is a personal knowledge synthesis workspace. All your data lives locally in your browser (IndexedDB) and syncs to Supabase when you're online. Total cost: $0.00/month.
        </p>
        <p className="text-[11px] text-text-muted">v0.1.0 — Phase 2</p>
      </section>
    </div>
  );
};

// ── Mobile bottom tab bar ─────────────────────────────────────
const MobileTabBar: React.FC = () => {
  const mobileTab = useAppStore((s) => s.mobileTab);
  const setMobileTab = useAppStore((s) => s.setMobileTab);

  const tabs: { key: typeof mobileTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "topics",
      label: "Topics",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      key: "search",
      label: "Search",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      key: "settings",
      label: "Settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-bg-surface border-t border-border flex safe-bottom">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          id={`mobile-tab-${tab.key}`}
          onClick={() => setMobileTab(tab.key)}
          className={[
            "flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors",
            mobileTab === tab.key ? "text-accent-purple" : "text-text-muted hover:text-text-body",
          ].join(" ")}
        >
          {tab.icon}
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

// ── Mobile Topics overlay ─────────────────────────────────────
const MobileTopicsOverlay: React.FC = () => {
  const mobileTab = useAppStore((s) => s.mobileTab);
  const setMobileTab = useAppStore((s) => s.setMobileTab);
  const selectedTopicId = useAppStore((s) => s.selectedTopicId);

  // Auto-close when a topic is selected
  useEffect(() => {
    if (selectedTopicId && mobileTab === "topics") {
      // Small delay to let the user see the selection
      const t = setTimeout(() => {
        // Keep the tab on topics but let canvas show
      }, 300);
      return () => clearTimeout(t);
    }
  }, [selectedTopicId, mobileTab]);

  return null; // The sidebar is shown in the layout below
};

// ── Main App ──────────────────────────────────────────────────
export const App: React.FC = () => {
  const { user, setUser } = useAppStore();
  const [authLoading, setAuthLoading] = useState(true);
  const mobileTab = useAppStore((s) => s.mobileTab);
  const selectedTopicId = useAppStore((s) => s.selectedTopicId);

  // Start sync (only activates when user is set)
  useSync();

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "" });
      }
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? "" });
        } else {
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [setUser]);

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size={48} />
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="h-dvh bg-bg-base flex flex-col overflow-hidden">
      {/* ── Desktop layout: three-column ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left: sidebar (220px) */}
        <div className="w-[220px] flex-shrink-0">
          <TopicSidebar />
        </div>

        {/* Center + Right: topic page fills remaining space */}
        <div className="flex-1 overflow-hidden">
          <TopicPage />
        </div>
      </div>

      {/* ── Mobile layout: single column + bottom tabs ── */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden pb-16">
        {mobileTab === "topics" && (
          selectedTopicId ? (
            <TopicPage />
          ) : (
            <div className="h-full overflow-y-auto">
              <TopicSidebar />
            </div>
          )
        )}
        {mobileTab === "search" && <SearchPage />}
        {mobileTab === "settings" && <SettingsPage />}
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </div>
  );
};
