"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

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
      // Pas de logique d'emailRedirectTo nécessaire tant qu'on ne fait
      // pas de vraie vérification d'email
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg(
      "Compte créé. Cette version est en phase de test : aucune vérification par e-mail n'est nécessaire. Vous pouvez vous connecter dès maintenant."
    );
    // Optionnel : redirection après quelques secondes
    // setTimeout(() => router.push("/auth/login"), 2000);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-10 shadow-2xl shadow-black/50 relative overflow-hidden ring-1 ring-white/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-green-start)]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--color-gold-text)]/10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="mb-6 text-2xl font-semibold text-center text-white">
          Créer un compte
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Adresse e-mail
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              placeholder="vous@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Mot de passe
            </label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-400">
              Minimum 6 caractères.
            </p>
          </div>

          <p className="mt-1 text-xs text-gray-400">
            Cette version est actuellement en phase de test. La vérification par
            e-mail n'est pas encore activée : vous pourrez vous connecter
            directement après la création de votre compte.
          </p>

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

          <Button
            type="submit"
            disabled={isLoading}
            variant="green"
            size="lg"
            className="w-full text-base font-semibold rounded-lg shadow-lg mt-6"
          >
            {isLoading ? "Création en cours..." : "Créer un compte"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Vous avez déjà un compte ?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-primary hover:underline"
          >
            Se connecter
          </button>
        </p>
      </div>
    </main>
  );
}
