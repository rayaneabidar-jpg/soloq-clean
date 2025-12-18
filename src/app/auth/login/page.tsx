"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (err) throw new Error(err.message);

      // Connexion réussie → redirige vers /challenges
      router.push("/challenges");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-10 shadow-2xl shadow-black/50 relative overflow-hidden ring-1 ring-white/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-green-start)]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--color-gold-text)]/10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-3xl font-bold mb-6 text-white text-center">Connexion</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-900 text-red-200 rounded">
            ❌ {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
              placeholder="toi@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="green"
            size="lg"
            className="w-full text-base font-semibold rounded-lg shadow-lg mt-6"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-4">
          Pas de compte ?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
