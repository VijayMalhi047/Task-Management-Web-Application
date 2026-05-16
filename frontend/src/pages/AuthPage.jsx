// pages/AuthPage.jsx
// Three screens: login → signup → otp verification
import { useState } from "react";
import { apiSignup, apiVerifyOtp, apiLogin } from "../api/auth";

const SCREENS = { LOGIN: "login", SIGNUP: "signup", OTP: "otp" };
const INITIAL_FORM = { username: "", email: "", password: "" };

export default function AuthPage({ onAuthSuccess }) {
  const [screen, setScreen]   = useState(SCREENS.LOGIN);
  const [form, setForm]       = useState(INITIAL_FORM);
  const [otp, setOtp]         = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  // ── Signup → triggers OTP email ───────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.username.trim())          return setError("Username is required.");
    if (!form.email.includes("@"))      return setError("Valid email is required.");
    if (form.password.length < 6)       return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      await apiSignup(form);
      setPendingEmail(form.email);
      setSuccess(`Verification code sent to ${form.email}`);
      setForm(INITIAL_FORM);
      setOtp("");
      setScreen(SCREENS.OTP);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP verification ──────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) return setError("Please enter the 6-digit code.");

    setLoading(true);
    try {
      const data = await apiVerifyOtp({ email: pendingEmail, otp });
      localStorage.setItem("taskflow_token", data.token);
      setForm(INITIAL_FORM);
      setOtp("");
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Login ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("All fields are required.");

    setLoading(true);
    try {
      const data = await apiLogin({ email: form.email, password: form.password });
      localStorage.setItem("taskflow_token", data.token);
      setForm(INITIAL_FORM);
      setOtp("");
      setPendingEmail("");
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goTo = (s) => {
    setScreen(s);
    setError("");
    setSuccess("");
    setForm(INITIAL_FORM);
    setOtp("");
    if (s !== SCREENS.OTP) setPendingEmail("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="font-mono text-3xl font-medium text-amber-400">TaskFlow</h1>
          <p className="font-sans text-sm text-slate-500 mt-1">Effective-RM Task Management</p>
          <div className="mt-4 mx-auto w-16 h-px bg-amber-400" />
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">

          {/* ── OTP Screen ──────────────────────────────────── */}
          {screen === SCREENS.OTP && (
            <div key="otp-screen">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30
                                flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 text-xl">✉</span>
                </div>
                <h2 className="font-mono text-sm text-slate-300 tracking-wider uppercase">
                  Check Your Email
                </h2>
                <p className="font-sans text-xs text-slate-500 mt-1">
                  We sent a 6-digit code to<br/>
                  <span className="text-slate-300">{pendingEmail}</span>
                </p>
              </div>

              {success && (
                <div className="mb-4 bg-green-950 border border-green-800 rounded px-3 py-2">
                  <p className="font-mono text-xs text-green-400">{success}</p>
                </div>
              )}

              <form key="otp-form" onSubmit={handleVerifyOtp} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-1
                                    tracking-wider uppercase">
                    Verification Code
                  </label>
                  {/* Large OTP input for easy entry */}
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                    placeholder="000000"
                    autoFocus
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-3
                               text-slate-100 font-mono text-2xl text-center tracking-[0.5em]
                               placeholder-slate-700 focus:outline-none focus:border-amber-400
                               transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-950 border border-red-800 rounded px-3 py-2">
                    <p className="font-mono text-xs text-red-400">⚠ {error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900
                             font-mono font-medium text-sm py-2.5 rounded
                             transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  type="button"
                  onClick={() => goTo(SCREENS.SIGNUP)}
                  className="w-full font-mono text-xs text-slate-500 hover:text-slate-300
                             transition-colors py-1"
                >
                  ← Back to signup
                </button>
              </form>
            </div>
          )}

          {/* ── Signup Screen ────────────────────────────────── */}
          {screen === SCREENS.SIGNUP && (
            <div key="signup-screen">
              <h2 className="font-mono text-sm text-slate-300 tracking-wider
                             uppercase text-center mb-5">
                Create Account
              </h2>
              <form key="signup-form" onSubmit={handleSignup} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-1
                                    tracking-wider uppercase">Username</label>
                  <input type="text" name="username" value={form.username}
                    onChange={handleChange} placeholder="johndoe" autoFocus autoComplete="off"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2
                               text-slate-100 font-sans text-sm placeholder-slate-600
                               focus:outline-none focus:border-amber-400 transition-colors"/>
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-1
                                    tracking-wider uppercase">Email</label>
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="you@example.com" autoComplete="off"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2
                               text-slate-100 font-sans text-sm placeholder-slate-600
                               focus:outline-none focus:border-amber-400 transition-colors"/>
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-1
                                    tracking-wider uppercase">Password</label>
                  <input type="password" name="password" value={form.password}
                    onChange={handleChange} placeholder="••••••••" autoComplete="new-password"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2
                               text-slate-100 font-sans text-sm placeholder-slate-600
                               focus:outline-none focus:border-amber-400 transition-colors"/>
                  <p className="font-mono text-xs text-slate-600 mt-1">Minimum 6 characters</p>
                </div>

                {error && (
                  <div className="bg-red-950 border border-red-800 rounded px-3 py-2">
                    <p className="font-mono text-xs text-red-400">⚠ {error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900
                             font-mono font-medium text-sm py-2.5 rounded
                             transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Sending code..." : "Register"}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-700 text-center">
                <p className="font-sans text-sm text-slate-500">
                  Already have an account?{" "}
                  <button onClick={() => goTo(SCREENS.LOGIN)}
                    className="font-mono text-amber-400 hover:text-amber-300 transition-colors">
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ── Login Screen ─────────────────────────────────── */}
          {screen === SCREENS.LOGIN && (
            <div key="login-screen">
              <h2 className="font-mono text-sm text-slate-300 tracking-wider
                             uppercase text-center mb-5">
                Welcome Back
              </h2>
              <form key="login-form" onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                />
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                />
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-1
                                    tracking-wider uppercase">Email</label>
                  <input type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="you@example.com" autoFocus autoComplete="off"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2
                               text-slate-100 font-sans text-sm placeholder-slate-600
                               focus:outline-none focus:border-amber-400 transition-colors"/>
                </div>
                <div>
                  <label className="block font-mono text-xs text-slate-400 mb-1
                                    tracking-wider uppercase">Password</label>
                  <input type="password" name="password" value={form.password}
                    onChange={handleChange} placeholder="••••••••" autoComplete="new-password"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2
                               text-slate-100 font-sans text-sm placeholder-slate-600
                               focus:outline-none focus:border-amber-400 transition-colors"/>
                </div>

                {error && (
                  <div className="bg-red-950 border border-red-800 rounded px-3 py-2">
                    <p className="font-mono text-xs text-red-400">⚠ {error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900
                             font-mono font-medium text-sm py-2.5 rounded
                             transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-700 text-center">
                <p className="font-sans text-sm text-slate-500">
                  Don't have an account?{" "}
                  <button onClick={() => goTo(SCREENS.SIGNUP)}
                    className="font-mono text-amber-400 hover:text-amber-300 transition-colors">
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}