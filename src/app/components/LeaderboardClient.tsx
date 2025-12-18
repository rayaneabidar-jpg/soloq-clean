// src/app/components/LeaderboardClient.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Search, RefreshCcw, ArrowLeft, Settings, XCircle } from "lucide-react";

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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function LeaderboardClient({ id, challengeName, onSettingsClick }: { id: string, challengeName?: string, onSettingsClick?: () => void }) {
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredRows = rows
    .filter((r) => !selectedTeam || r.team === selectedTeam)
    .filter((r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8">
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${toast.type === "success"
            ? "bg-green-600 text-white"
            : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white"
            }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">{challengeName ? `${challengeName} :` : "Challenge :"}</h1>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <Input
              placeholder="Rechercher un joueur"
              className="pl-10 bg-[#1a1a1a] border-[#333] focus:border-[var(--color-green-start)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <form onSubmit={handleAddPlayer} className="flex gap-2">
            <Button
              type="submit"
              disabled={addingPlayer}
              variant="green"
              className="h-12 px-6 rounded-xl"
            >
              {addingPlayer ? "..." : "Ajouter"}
            </Button>
            <Input
              placeholder="Pseudo#Tag"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-[#1a1a1a] border-[#333] w-40 hidden"
              disabled={addingPlayer}
            />
            {/* Note: In the design "Ajouter" is a button next to search? Or is the search bar strictly for filtering and there's a separate add input? 
                 The design shows "Rechercher un joueur" input and "Ajouter" button.
                 I'll assume the input next to "Ajouter" logic is hidden or integrated. 
                 Wait, the design (Image 0) shows "Rechercher un joueur" [Ajouter] button. 
                 It implies the search bar MIGHT be the input for adding ?? Or search is for filtering the list.
                 Usually "Rechercher" filters, and there is a separate "Ajouter" flow.
                 However, in the previous code, there was a separate input for Adding.
                 I'll keep the Add input but maybe style it better or put it in a modal if I want to match the "clean" header. 
                 But to respect "Same functionality", I must keep the input visible if it's the only way to add.
                 In the previous code: Input (Pseudo#Tag) + Button (Ajouter).
                 I will keep it but style it nicely.
             */}
          </form>
          {/* Re-adding the input for "Ajouter" properly */}
          <form onSubmit={handleAddPlayer} className="flex gap-2 items-center">
            <Input
              placeholder="Pseudo#Tag"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-[#1a1a1a] h-12 w-40 border border-white/10"
            />
            <Button variant="green" type="submit" disabled={addingPlayer} className="h-12">
              Ajouter
            </Button>
          </form>

          <Button variant="ghost" onClick={() => syncMatches()} disabled={updating} className="h-12 text-white/50 hover:text-white bg-[#1a1a1a] border border-white/5">
            {updating ? <RefreshCcw className="animate-spin" size={16} /> : "Rafraîchir"}
          </Button>

          <Button variant="ghost" onClick={() => router.push("/challenges")} className="h-12 text-white/50 hover:text-white bg-[#1a1a1a] border border-white/5">
            Retour
          </Button>

          <Button variant="ghost" size="icon" className="h-12 w-12 text-white/50 hover:text-white bg-[#1a1a1a] border border-white/5 rounded-xl" onClick={onSettingsClick}>
            <Settings size={20} />
          </Button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 bg-gradient-to-b from-[var(--color-green-start)] to-[var(--color-green-end)] px-6 py-3 text-sm font-normal text-white border-b border-white/10">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-3">Joueur</div>
          <div className="col-span-3">Rank Initial</div>
          <div className="col-span-1 text-center">Victoires</div>
          <div className="col-span-1 text-center">Défaites</div>
          <div className="col-span-1 text-center">Lp gagnés</div>
          <div className="col-span-2 text-right">Rank</div>
        </div>

        {filteredRows.length > 0 ? (
          <div className="divide-y divide-white/5 bg-[#111111]">
            {filteredRows.map((r, index) => (
              <div key={r.playerId} className="grid grid-cols-12 px-6 py-3 text-sm items-center hover:bg-white/5 transition-colors group">
                <div className="col-span-1 text-center">
                  <span className={`inline-flex items-center justify-center text-[#00D1FF] font-medium`}>
                    {index + 1}
                  </span>
                </div>
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#2a2a2a] rounded-full flex-shrink-0 border border-white/10"></div>
                  <div className="overflow-hidden">
                    <div className="font-medium text-white truncate text-sm">{r.name}</div>
                    <div className="text-[10px] text-white/40 truncate">{r.team || "Sans équipe"}</div>
                  </div>
                </div>
                <div className="col-span-3 text-white/70 font-light">{r.mainRank}</div>
                <div className="col-span-1 text-center text-white/70">{r.wins}</div>
                <div className="col-span-1 text-center text-white/70">{r.losses}</div>
                <div className="col-span-1 text-center text-white/70">{r.lpGained}</div>
                <div className="col-span-2 flex items-center justify-end gap-4">
                  <span className="text-white/70 text-right font-light">{r.rankLabel || "Unranked"}</span>
                  <button
                    onClick={() => handleRemovePlayer(r.playerId)}
                    className="text-white/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/30">
            Aucun joueur trouvé
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="danger" className="text-sm px-6 py-2 h-10 rounded-lg">
          Supprimer
        </Button>
      </div>
    </div>
  );
}
