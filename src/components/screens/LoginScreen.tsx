import { useState } from "react";
import { useAuthStore } from "@/features/authStore";

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onSignUp?: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { signIn, loading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    // Check for errors in the URL (e.g. from Supabase redirect)
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorMsg = params.get("error_description") || hashParams.get("error_description") || params.get("error") || hashParams.get("error");
    if (errorMsg) {
      setError(errorMsg.replace(/\+/g, " "));
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  });

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signIn();
      onLoginSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          background: var(--bg);
        }

        .login-hero {
          flex: 1;
          background: linear-gradient(135deg, #1a9e6e 0%, #0f6e56 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .login-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 400px;
        }

        .hero-logo {
          font-family: var(--font);
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .hero-tagline {
          font-size: 20px;
          opacity: 0.9;
          margin-bottom: 3rem;
          line-height: 1.5;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .hero-stat {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.25rem;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .hero-stat-value {
          font-family: var(--font);
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .hero-stat-label {
          font-size: 12px;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .hero-value-props {
          text-align: left;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .value-prop {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
          font-size: 14px;
        }

        .value-prop:last-child {
          margin-bottom: 0;
        }

        .value-icon {
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .login-form {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem;
          background: white;
        }

        .login-form-content {
          width: 100%;
          max-width: 400px;
        }

        .login-logo {
          font-family: var(--font);
          font-size: 32px;
          font-weight: 700;
          color: var(--g);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .login-title {
          font-family: var(--font);
          font-size: 32px;
          font-weight: 700;
          color: var(--t);
          margin-bottom: 12px;
          text-align: center;
        }

        .login-subtitle {
          font-size: 16px;
          color: var(--t2);
          margin-bottom: 3rem;
          text-align: center;
          line-height: 1.6;
        }

        .google-btn {
          width: 100%;
          padding: 16px 24px;
          background: white;
          border: 2px solid var(--bd);
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          color: var(--t);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .google-btn:hover {
          border-color: var(--g);
          box-shadow: 0 10px 15px -3px rgba(26, 158, 110, 0.2);
          transform: translateY(-4px);
        }

        .google-btn:active {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(26, 158, 110, 0.1);
        }

        .google-btn svg {
          width: 24px;
          height: 24px;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .login-terms {
          margin-top: 4rem;
          font-size: 13px;
          color: var(--t3);
          text-align: center;
          line-height: 1.8;
          max-width: 320px;
          margin-left: auto;
          margin-right: auto;
        }

        .login-terms a {
          color: var(--g);
          text-decoration: none;
          font-weight: 500;
        }

        .login-terms a:hover {
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .login-page {
            flex-direction: column;
          }

          .login-hero {
            padding: 3rem 2rem;
            min-height: 40vh;
          }

          .hero-logo {
            font-size: 40px;
          }

          .hero-tagline {
            font-size: 18px;
            margin-bottom: 2rem;
          }

          .hero-stats {
            margin-bottom: 0;
          }

          .hero-value-props {
            display: none;
          }

          .login-form {
            padding: 3rem 2rem;
          }
        }
      `}</style>

      {/* Left Side - Hero */}
      <div className="login-hero">
        <div className="hero-content">
          <div className="hero-logo">
            <svg viewBox="0 0 32 32" fill="none" width="56" height="56">
              <circle cx="16" cy="16" r="15" fill="white" opacity="0.2" />
              <path
                d="M9 12c0 7 7 11 7 11s7-4 7-11"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="16" cy="9" r="3" fill="white" />
            </svg>
            SEWA
          </div>
          <div className="hero-tagline">
            A Network Built on Altruism — Connect with helpers, report problems, and make a difference.
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">4.2L+</div>
              <div className="hero-stat-label">Lives Impacted</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">₹38Cr</div>
              <div className="hero-stat-label">Funds Mobilised</div>
            </div>
          </div>

          <div className="hero-value-props">
            <div className="value-prop">
              <div className="value-icon">📍</div>
              <div>Report problems with precise GPS tagging</div>
            </div>
            <div className="value-prop">
              <div className="value-icon">🩺</div>
              <div>Direct chat with verified Professionals</div>
            </div>
            <div className="value-prop">
              <div className="value-icon">👩‍⚕️</div>
              <div>Ground verification by ASHA workers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form">
        <div className="login-form-content">
          <div className="login-logo">
            <svg viewBox="0 0 28 28" fill="none" width="40" height="40">
              <circle cx="14" cy="14" r="13" fill="#1a9e6e" opacity="0.15" />
              <path
                d="M8 10c0 6 6 10 6 10s6-4 6-10"
                stroke="#1a9e6e"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="14" cy="8" r="2.5" fill="#1a9e6e" />
            </svg>
            SEWA
          </div>

          <h1 className="login-title">Get Started</h1>
          <p className="login-subtitle">
            Sign in or create an account to start reporting problems and helping your community.
          </p>

          {error && (
            <div className="error-message">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <button
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <span>Redirecting...</span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="login-terms">
            By continuing, you are agreeing to SEWA's{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
