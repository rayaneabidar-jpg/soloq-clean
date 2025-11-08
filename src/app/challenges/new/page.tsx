"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const rankingRuleOptions = [
  { label: "LP", value: "lp_gained" },
  { label: "Victoires", value: "wins_losses" },
  { label: "Rang", value: "fresh_rank" },
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

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur création");

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
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Créer un Challenge</h1>

      {error && <div className="mb-4 text-red-500">❌ {error}</div>}
      {success && <div className="mb-4 text-green-500">✔ {success}</div>}

      <form onSubmit={onCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            required
            minLength={3}
            maxLength={50}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Début</label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Fin (optionnel)</label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Mode de classement</label>
          <select
            value={rule}
            onChange={(e) => setRule(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          >
            {rankingRuleOptions.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:bg-gray-600"
        >
          {busy ? "Création..." : "Créer"}
        </button>
      </form>

      <button
        onClick={() => router.push("/challenges")}
        className="mt-6 w-full py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
      >
        Retour à la liste des challenges
      </button>
    </div>
  );
}
