"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Search, RefreshCcw, ArrowLeft, Settings, XCircle, Trash2, Pencil, Check, X, Loader2 } from "lucide-react";
import { getDisplayNameFromRiotId } from "@/lib/utils";

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
  profileIconId?: number;
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

export default function LeaderboardClient({ id, challengeName, onSettingsClick, onDeleteClick }: { id: string, challengeName?: string, onSettingsClick?: () => void, onDeleteClick?: () => void }) {
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
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [ddragonVersion, setDdragonVersion] = useState("13.24.1"); // Default fallback

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentName, setCurrentName] = useState(challengeName || "Challenge");
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (challengeName) {
      setCurrentName(challengeName);
    }
  }, [challengeName]);

  // Fetch DDragon version
  useEffect(() => {
    fetch("https://ddragon.leagueoflegends.com/api/versions.json")
      .then(r => r.json())
      .then(versions => {
        if (versions && versions.length > 0) {
          setDdragonVersion(versions[0]);
        }
      })
      .catch(e => console.error("Failed to fetch ddragon version", e));
  }, []);

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

  // Edit Name Handlers
  const handleStartEdit = () => {
    setEditedName(currentName);
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName.trim().length < 3) {
      setToast({ type: "error", msg: "Le nom doit faire au moins 3 caractères" });
      return;
    }

    if (editedName === currentName) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Connexion requise");

      const res = await fetch(`/api/challenges/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editedName }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Erreur lors de la sauvegarde");

      setCurrentName(json.challenge.name);
      setIsEditingName(false);
      setToast({ type: "success", msg: "Nom du challenge mis à jour !" });
      router.refresh();
    } catch (e: any) {
      setToast({ type: "error", msg: e.message });
    } finally {
      setSavingName(false);
    }
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

  const toggleSelection = (playerId: string) => {
    const newSet = new Set(selectedPlayerIds);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
    } else {
      newSet.add(playerId);
    }
    setSelectedPlayerIds(newSet);
  };

  const toggleAll = () => {
    if (selectedPlayerIds.size === filteredRows.length && filteredRows.length > 0) {
      setSelectedPlayerIds(new Set());
    } else {
      setSelectedPlayerIds(new Set(filteredRows.map(r => r.playerId)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPlayerIds.size === 0) return;
    if (!confirm(`Voulez-vous vraiment supprimer ${selectedPlayerIds.size} joueur(s) du challenge ?`)) return;

    setUpdating(true);
    setToast({ type: "info", msg: "Suppression en cours..." });

    let successCount = 0;
    let failCount = 0;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      setToast({ type: "error", msg: "Non connecté" });
      setUpdating(false);
      return;
    }

    // Parallel requests
    const promises = Array.from(selectedPlayerIds).map(async (pid) => {
      try {
        const res = await fetch(`/api/challenges/${id}/remove-player`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ playerId: pid }),
        });
        if (!res.ok) throw new Error("Failed");
        return true;
      } catch {
        return false;
      }
    });

    const results = await Promise.all(promises);
    successCount = results.filter(r => r).length;
    failCount = results.filter(r => !r).length;

    if (failCount === 0) {
      setToast({ type: "success", msg: `${successCount} joueur(s) supprimé(s) !` });
    } else {
      setToast({ type: "info", msg: `${successCount} supprimé(s), ${failCount} échec(s).` });
    }

    setSelectedPlayerIds(new Set());
    await loadLeaderboard();
    setUpdating(false);
  };

  const filteredRows = rows
    .filter((r) => !selectedTeam || r.team === selectedTeam)
    .filter((r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="text-red-400 p-4 bg-red-950 rounded-lg border border-red-800">
        {error}
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Toast */}
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
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">

        <div className="flex items-center gap-4 w-full xl:w-auto">
          {/* Back Button (Moved to Left) */}
          <Button
            variant="ghost"
            onClick={() => router.push("/challenges")}
            className="h-10 w-10 p-0 text-white/50 hover:text-white bg-[#1a1a1a] border border-white/5 rounded-xl shrink-0 transition-colors"
            title="Retour aux challenges"
          >
            <ArrowLeft size={20} />
          </Button>

          {/* Title & Edit Area */}
          {isEditingName ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="h-10 bg-[#1a1a1a] border-white/20 text-white font-bold text-xl md:text-2xl w-full md:w-64 focus:ring-[var(--color-green-start)]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <Button
                disabled={savingName}
                onClick={handleSaveName}
                variant="green"
                size="icon"
                className="h-10 w-10 text-white shrink-0 rounded-lg"
              >
                {savingName ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              </Button>
              <Button
                disabled={savingName}
                onClick={handleCancelEdit}
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-red-400 hover:text-red-300 hover:bg-white/5 shrink-0 rounded-lg border border-white/5"
              >
                <X size={18} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight break-words max-w-full">
                {currentName}
              </h1>
              <button
                onClick={handleStartEdit}
                className="text-white/20 group-hover:text-white/50 hover:!text-[var(--color-green-start)] transition-colors p-2 rounded-lg hover:bg-white/5"
                title="Modifier le nom"
              >
                <Pencil size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Bulk Delete Button */}
          {selectedPlayerIds.size > 0 && (
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              className="w-full md:w-auto px-4 h-12 flex items-center gap-2 animate-in fade-in slide-in-from-right-4"
            >
              <Trash2 size={18} />
              <span>Supprimer ({selectedPlayerIds.size})</span>
            </Button>
          )}

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <Input
              placeholder="Rechercher..."
              className="pl-10 bg-[#1a1a1a] border-[#333] focus:border-[var(--color-green-start)] w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <form onSubmit={handleAddPlayer} className="flex gap-2 items-center w-full sm:w-auto">
              <Input
                placeholder="Pseudo#Tag"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-[#1a1a1a] h-12 w-full sm:w-40 border border-white/10"
              />
              <Button variant="green" type="submit" disabled={addingPlayer} className="h-12 px-6 shrink-0">
                Ajouter
              </Button>
            </form>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="ghost" onClick={() => syncMatches()} disabled={updating} className="h-12 text-white/50 hover:text-white bg-[#1a1a1a] border border-white/5 flex-1 sm:flex-none">
                {updating ? <RefreshCcw className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
              </Button>

              <Button variant="ghost" size="icon" className="h-12 w-12 text-white/50 hover:text-white bg-[#1a1a1a] border border-white/5 rounded-xl shrink-0" onClick={onSettingsClick}>
                <Settings size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table with Checkbox */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        {/* Header - Adjusted Grid (Removed Checkbox Column) */}
        <div className="grid grid-cols-[40px_1fr_1fr_1fr] md:grid-cols-[50px_3fr_1.5fr_1fr_1fr_1fr_1.5fr] items-center gap-2 md:gap-4 px-4 md:px-6 py-3 text-xs md:text-sm font-normal text-white bg-gradient-to-b from-[var(--color-green-start)] to-[var(--color-green-end)] border-b border-white/5">
          <div className="text-center">#</div>
          <div className="">Joueur</div>
          <div className="">Rank</div>
          <div className="hidden sm:block text-center">V</div>
          <div className="hidden sm:block text-center">D</div>
          <div className="text-center">LP</div>
          <div className="hidden md:block text-right">Rank Initial</div>
        </div>

        {filteredRows.length > 0 ? (
          <div className="divide-y divide-white/5 bg-[#111111]">
            {filteredRows.map((r, index) => (
              <div
                key={r.playerId}
                onClick={() => toggleSelection(r.playerId)}
                className={`grid grid-cols-[40px_1fr_1fr_1fr] md:grid-cols-[50px_3fr_1.5fr_1fr_1fr_1fr_1.5fr] px-4 md:px-6 py-3 text-xs md:text-sm items-center transition-colors group cursor-pointer ${selectedPlayerIds.has(r.playerId) ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <div className="text-center text-[#00D1FF] font-medium">
                  {index + 1}
                </div>
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  {/* Profile Icon showing */}
                  {r.profileIconId ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${r.profileIconId}.png`}
                      alt="Icon"
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/10"
                    />
                  ) : (
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-[#2a2a2a] rounded-full flex-shrink-0 border border-white/10"></div>
                  )}

                  <div className="overflow-hidden min-w-0">
                    <div className="font-medium text-white truncate">{getDisplayNameFromRiotId(r.name)}</div>
                    <div className="text-[10px] text-white/40 truncate hidden sm:block">{r.team || "Sans équipe"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 min-w-0">
                  <span className="text-white/90 block font-medium truncate max-w-[80px] sm:max-w-none">{r.rankLabel || "Unranked"}</span>
                </div>
                <div className="hidden sm:block text-center text-white/70">{r.wins}</div>
                <div className="hidden sm:block text-center text-white/70">{r.losses}</div>
                <div className={`text-center font-medium ${r.lpGained > 0 ? 'text-green-400' : r.lpGained < 0 ? 'text-red-400' : 'text-white/70'}`}>
                  {r.lpGained > 0 ? `+${r.lpGained}` : r.lpGained}
                </div>
                <div className="flex items-center justify-end gap-2 md:gap-4 ml-auto w-full">
                  <div className="hidden md:block text-white/70 font-light truncate text-right w-full">{r.mainRank}</div>
                  {/* Individual Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePlayer(r.playerId);
                    }}
                    className="text-white/30 hover:text-red-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1"
                  >
                    <XCircle size={14} className="md:w-4 md:h-4" />
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
        {onDeleteClick && !selectedPlayerIds.size && (
          <Button variant="danger" onClick={onDeleteClick} className="text-sm px-6 py-2 h-10 rounded-lg opacity-50 hover:opacity-100 transition-opacity">
            Supprimer le challenge
          </Button>
        )}
      </div>
    </div>
  );
}
