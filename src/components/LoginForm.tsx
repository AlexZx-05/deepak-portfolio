"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    setIsError(false);

    try {
      const response = await fetch("/api/admin/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = result && typeof result === "object" && "error" in result
          ? String(result.error)
          : "Could not request a sign-in code.";
        setStatus(message);
        setIsError(true);
        return;
      }

      setCodeSent(true);
      setStatus("A six-digit sign-in code has been sent. Check your inbox and spam folder.");
    } catch {
      setStatus("Could not request a sign-in code. Check your connection and try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    setIsError(false);

    try {
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false
      });

      if (result?.error) {
        setStatus("That code is invalid, expired, or already used. Request a new code and try again.");
        setIsError(true);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setStatus("Could not verify the sign-in code. Check your connection and try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  if (!codeSent) {
    return (
      <form className="admin-form" onSubmit={requestCode}>
        <label>
          <span>Admin email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {status ? <p className={isError ? "admin-login-error" : "admin-muted"} role={isError ? "alert" : "status"}>{status}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={loading || !email.trim()}>
          {loading ? "Sending code…" : "Email me a sign-in code"}
        </button>
      </form>
    );
  }

  return (
    <form className="admin-form" onSubmit={verifyCode}>
      <p className="admin-muted">Enter the six-digit code sent to {email}. It expires in 10 minutes.</p>
      <label>
        <span>Sign-in code</span>
        <input
          name="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoComplete="one-time-code"
          required
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
        />
      </label>
      {status ? <p className={isError ? "admin-login-error" : "admin-muted"} role={isError ? "alert" : "status"}>{status}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={loading || otp.length !== 6}>
        {loading ? "Verifying…" : "Verify and sign in"}
      </button>
      <button
        className="admin-otp-resend"
        type="button"
        disabled={loading}
        onClick={() => {
          setCodeSent(false);
          setOtp("");
          setStatus("");
          setIsError(false);
        }}
      >
        Use a different email or request another code (60-second limit)
      </button>
    </form>
  );
}
