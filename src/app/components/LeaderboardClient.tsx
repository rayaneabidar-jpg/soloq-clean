// src/app/components/LeaderboardClient.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Row = {
  playerId: string;
  name: string;
  team: string | null;
  puuid: string | null;
  wins: number;
  losses: number;
  lpGained: number;
  ordEnd: number;
  rankLabel: string;
  mainRank: string;
};

type Toast = {
  type: "success" | "error" | "info";
  msg: string;
} | null;

function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
    </div>
  );
}

export default function LeaderboardClient({ id }: { id: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const [playerName, setPlayerName] = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teams, setTeams] = useState<string[]>([]);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/challenges/${id}/leaderboard`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");
      setRows(json.leaderboard || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (e: any) {
      setError(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const syncMatches = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Connexion requise");

      setUpdating(true);
      setUpdateProgress("Mise à jour en cours...");

      const res = await fetch(`/api/challenges/${id}/snapshot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur sync");

      setUpdateProgress(`Snapshot créé : ${json.inserted || 0} joueur(s)`);
      await loadLeaderboard();
      setToast({ type: "success", msg: "Mise à jour réussie !" });
    } catch (e: any) {
      setToast({ type: "error", msg: e.message });
    } finally {
      setUpdating(false);
      setUpdateProgress("");
    }
  }, [id, loadLeaderboard]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setToast({ type: "error", msg: "Veuillez entrer un nom de joueur." });
      return;
    }
    setAddingPlayer(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Connexion requise");

      let requestBody: any = {};
      if (playerName.includes("#")) {
        requestBody = {
          players: [{ riotId: playerName.trim(), region: "EUW" }],
        };
      } else {
        requestBody = {
          players: [{ summonerName: playerName.trim(), region: "EUW" }],
        };
      }

      const res = await fetch(`/api/challenges/${id}/players`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const json = await res.json();

      if (json.inserted && json.inserted.length > 0) {
        setPlayerName("");
        setToast({ type: "success", msg: "✅ Joueur ajouté !" });
        await syncMatches();
      } else if (json.failed && json.failed.length > 0) {
        throw new Error(`❌ ${json.failed[0].reason}`);
      } else if (json.skipped && json.skipped.length > 0) {
        setToast({
          type: "error",
          msg: "⚠️ Ce joueur est déjà dans le challenge",
        });
      } else {
        throw new Error("Aucun joueur ajouté");
      }
    } catch (e: any) {
      setToast({ type: "error", msg: e.message });
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!confirm("Supprimer ce joueur du challenge ?")) return;
    setError(null);
    setAddingPlayer(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Connexion requise");

      const res = await fetch(`/api/challenges/${id}/remove-player`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ playerId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur suppression joueur");

      await loadLeaderboard();
      setToast({ type: "success", msg: "Joueur supprimé avec succès !" });
    } catch (e: any) {
      setToast({ type: "error", msg: e.message });
    } finally {
      setAddingPlayer(false);
    }
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const uniqueTeams = Array.from(
      new Set(rows.map((r) => r.team).filter(Boolean))
    ) as string[];
    setTeams(uniqueTeams);
  }, [rows]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadLeaderboard();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadLeaderboard]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="text-red-400 p-4 bg-red-950 rounded-lg border border-red-800">
        {error}
      </div>
    );

  const filteredRows = selectedTeam
    ? rows.filter((r) => r.team === selectedTeam)
    : rows;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen text-white rounded-lg">
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Ranking Challenge</h1>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (5min)
            </label>
            {lastUpdated && (
              <span className="text-sm text-gray-400">
                Mis à jour : {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleAddPlayer} className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Pseudo#Tag ou nom du joueur"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="flex-grow px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            disabled={addingPlayer}
            aria-label="Nom du joueur"
          />
          <button
            type="submit"
            disabled={addingPlayer}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:bg-gray-600"
          >
            {addingPlayer ? "Ajout..." : "Ajouter"}
          </button>
        </form>

        <div className="mb-4 flex gap-3 items-center">
          <label className="text-sm text-gray-300">Filtrer par équipe :</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            <option value="">Toutes les équipes</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => syncMatches()}
            disabled={updating}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {updating ? "Mise à jour..." : "Rafraîchir manuellement"}
          </button>
          <button
            onClick={() => router.push("/challenges")}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Retour aux challenges
          </button>
        </div>

        {updateProgress && (
          <div className="mt-4 px-6 py-3 bg-gray-900 border border-gray-700 text-blue-300 text-sm flex items-center gap-3 rounded">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            {updateProgress}
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Classement</h2>
        </div>

        {filteredRows && filteredRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rang
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joueur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Équipe
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rang Initial
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Victoires
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Défaites
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    LP Gagnés
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rang Actuel
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredRows.map((r, index) => (
                  <tr
                    key={r.playerId}
                    className="hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-900 text-yellow-300"
                              : index === 1
                              ? "bg-gray-700 text-gray-300"
                              : index === 2
                              ? "bg-orange-900 text-orange-300"
                              : "bg-blue-900 text-blue-300"
                          }`}
                        >
                          {index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{r.name}</div>
                      {r.puuid && (
                        <div className="text-sm text-gray-400">
                          ID: {r.puuid.slice(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.team
                            ? "bg-blue-900 text-blue-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {r.team || "Aucune"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-blue-300 font-semibold">{r.mainRank}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-green-400 font-semibold">{r.wins}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-red-400 font-semibold">{r.losses}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`font-semibold ${
                          r.lpGained > 0
                            ? "text-green-400"
                            : r.lpGained < 0
                            ? "text-red-400"
                            : "text-gray-400"
                        }`}
                      >
                        {r.lpGained > 0 ? "+" : ""}
                        {r.lpGained || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {r.rankLabel ? (
                          r.rankLabel
                        ) : (
                          <span className="text-gray-500 italic">Pas de données</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleRemovePlayer(r.playerId)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">😕</div>
            <div className="text-gray-300">Aucun joueur dans ce challenge</div>
            <div className="text-gray-500 text-sm mt-1">
              Ajoutez des joueurs pour commencer !
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
