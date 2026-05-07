import { useState } from "react";
import { useAuth } from "../context/authContext.jsx";

export default function LoginPage() {
  const { user, login, signup, logout } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await signup({ email, password });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      const errorMsg = isSignup
        ? err.message || "Unable to sign up. Please try again."
        : err.message || "Unable to sign in. Please check your credentials.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <main className="login-shell">
        <div className="login-card">
          <h1>Welcome back!</h1>
          <p>You are signed in as <strong>{user.email || user.user_metadata?.email || "your account"}</strong>.</p>
          <button className="login-button" onClick={logout}>
            Logout
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="login-shell">
      <div className="login-card">
        <h1>{isSignup ? "Create Account" : "Sign in"}</h1>
        <p>{isSignup 
          ? "Create a new account to get started with Task Tracker." 
          : "Use your email and password to sign in to Task Tracker."}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button className="login-button" type="submit" disabled={loading}>
            {loading 
              ? (isSignup ? "Creating account..." : "Signing in...")
              : (isSignup ? "Sign up" : "Sign in")
            }
          </button>
        </form>

        <p className="login-toggle">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setEmail("");
              setPassword("");
            }}
            className="login-toggle-button"
          >
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}
