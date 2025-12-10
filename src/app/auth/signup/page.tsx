"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg(
      "Compte créé. Vérifiez votre boîte mail pour confirmer votre inscription."
    );
    // Optionnel : redirection après quelques secondes
    // setTimeout(() => router.push("/auth/login"), 3000);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg border border-slate-800">
        <h1 className="mb-6 text-2xl font-semibold text-center">
          Créer un compte
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="vous@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-slate-400">
              Minimum 6 caractères.
            </p>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-sm text-emerald-400">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-60"
          >
            {isLoading ? "Création en cours..." : "Créer un compte"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Vous avez déjà un compte ?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-blue-400 hover:underline"
          >
            Se connecter
          </button>
        </p>
      </div>
    </main>
  );
}
