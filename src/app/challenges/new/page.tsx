"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Trophy, Calendar, Share2 } from "lucide-react";
import { cn } from "@/app/components/ui/Button"; // Reusing cn utility if exported, or just import from utils if I had one. I'll use clsx/tailwind-merge directly or just inline styles if needed, but I think I exported cn from Button? No, I exported it from Button.tsx but it's not a default export. I'll just copy cn or import it.
// Actually I exported cn from Button.tsx.



const rankingRuleOptions = [
  { label: "Par LP", value: "lp_gained", description: "Classement basé sur les League Points" },
  { label: "Par Rang", value: "fresh_rank", description: "Classement basé sur le rang atteint" },
];

export default function NewChallengePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startAt, setStartAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [endAt, setEndAt] = useState("");
  const [rule, setRule] = useState("lp_gained");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);

    if (name.trim().length < 3) {
      setError("Le nom doit faire au moins 3 caractères");
      setBusy(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("❌ Vous devez être connecté");

      const payload = {
        name: name.trim(),
        start_at: startAt,
        end_at: endAt || null,
        ranking_rule: rule,
        mode: "existing",
        max_participants: 20,
        visibility: "public",
        scoring_rule: "lp_only",
        disclaimer: "Projet non affilié à Riot Games.",
      };

      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let json;
      try {
        json = await res.json();
      } catch (err) {
        // Ignorer l'erreur de parsing si le status est déjà en erreur, on gère juste après
        if (!res.ok) {
          // fallback error based on status
          throw new Error(`Erreur serveur (${res.status})`);
        }
        // Si c'est un 200/201 mais pas de JSON, c'est louche mais on passe
        // Cela dit, avec notre fix API, on renvoie toujours du JSON.
        console.warn("Réponse non-JSON reçue", err);
      }

      if (!res.ok) {
        throw new Error(json?.error || `Erreur création (${res.status})`);
      }

      setSuccess("Challenge créé avec succès !");
      setError(null);
      // Redirection un peu différée après feedback
      setTimeout(() => {
        router.push("/challenges");
      }, 1500);
    } catch (e: any) {
      setError(e.message);
      setSuccess(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 w-full">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Créer un nouveau challenge</h1>
          <p className="text-white/50">Configurez votre tournoi et partagez-le avec vos amis</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 shadow-2xl">
          {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 text-red-200 rounded-lg text-sm">❌ {error}</div>}
          {success && <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-900/50 text-emerald-200 rounded-lg text-sm">✔ {success}</div>}

          <form onSubmit={onCreate} className="space-y-8">
            {/* Nom */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-base font-medium text-white">
                <Trophy className="text-[var(--color-gold-start)]" size={18} />
                Nom du challenge
              </label>
              <Input
                type="text"
                placeholder="Ex: KC Fans 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-base bg-[#242424]"
                required
                minLength={3}
                maxLength={50}
              />
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-base font-medium text-white">
                  <Calendar className="text-[var(--color-gold-start)]" size={18} />
                  Date de début
                </label>
                <Input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="bg-[#242424]"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-base font-medium text-white">
                  <Calendar className="text-[var(--color-gold-start)]" size={18} />
                  Date de fin
                </label>
                <Input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="bg-[#242424]"
                />
              </div>
            </div>

            {/* Mode de classement */}
            <div className="space-y-3">
              <label className="block text-lg font-medium text-white">Mode de classement</label>
              <div className="grid md:grid-cols-2 gap-4">
                {rankingRuleOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setRule(option.value)}
                    className={cn(
                      "cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden",
                      rule === option.value
                        ? "bg-[#242424] border-[var(--color-green-start)]"
                        : "bg-[#242424] border-transparent hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-1 relative z-10">
                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        rule === option.value ? "border-[var(--color-green-start)]" : "border-white/20"
                      )}>
                        {rule === option.value && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-green-start)]" />}
                      </div>
                      <span className={cn("font-medium", rule === option.value ? "text-white" : "text-white/70")}>
                        {option.label}
                      </span>
                    </div>
                    <p className="text-sm text-white/40 pl-8 relative z-10">{option.description}</p>

                    {rule === option.value && (
                      <div className="absolute inset-0 bg-[var(--color-green-start)]/5 pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              variant="green"
              size="lg"
              className="w-full text-base font-semibold rounded-lg shadow-lg mt-6"
            >
              {busy ? (
                "Création..."
              ) : (
                <span className="flex items-center gap-2">
                  <Share2 size={18} />
                  Créer et générer le lien de partage
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
