"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signUpUser } from "../../../../services/auth";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/SupabaseClient";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const signup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessage("All fields are required!");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    // Check password strength (minimum 6 characters)
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    const result = await signUpUser(email, password);
    if (result?.error) {
      setMessage(result.error);
      setMessageType("error");
    } else {
      setMessage("✓ Signup successful! Redirecting to profile setup...");
      setMessageType("success");
      setTimeout(() => {
        router.replace("/auth/callback");
      }, 2000);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/auth/callback");
      }
    });
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="max-w-[350px] w-[95%] py-12 px-6 rounded-lg">
        <div className="mb-8">
          <h1 className="font-bold text-4xl text-white mb-2">BinghamHub</h1>
          <p className="text-secondary-text text-sm">Join Bingham University's community</p>
        </div>

        <h2 className="font-bold text-2xl text-primary-text mb-6">Create your account</h2>

        {message && (
          <div
            className={`py-3 px-4 mb-6 font-semibold text-center rounded-lg ${
              messageType === "error"
                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                : "bg-green-500/20 text-green-400 border border-green-500/50"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={signup}>
          <div className="mb-4">
            <label className="text-secondary-text text-xs block mb-2 font-semibold">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@binghamuni.edu.ng"
              className="w-full bg-background outline-none rounded-lg p-4 placeholder-secondary-text border border-border text-white focus:border-primary transition-colors"
            />
            <p className="text-xs text-secondary-text mt-1">
              Must be @binghamuni.edu.ng email address
            </p>
          </div>

          <div className="mb-6">
            <label className="text-secondary-text text-xs block mb-2 font-semibold">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full bg-background outline-none rounded-lg p-4 placeholder-secondary-text border border-border text-white focus:border-primary transition-colors"
            />
            <p className="text-xs text-secondary-text mt-1">
              Minimum 6 characters
            </p>
          </div>

          <button
            disabled={isLoading}
            className="text-black w-full rounded-full h-11 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 font-semibold bg-white disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Creating account..." : "Continue"}
          </button>
        </form>

        <div className="text-secondary-text mt-8 text-center">
          <span className="mr-1">Already have an account?</span>
          <Link href="/" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-xs text-secondary-text text-center">
          <p>Only Bingham University students and staff can join</p>
        </div>
      </div>
    </div>
  );
}
