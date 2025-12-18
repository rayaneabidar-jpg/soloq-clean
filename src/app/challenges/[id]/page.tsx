"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LeaderboardClient from "@/app/components/LeaderboardClient";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { X } from "lucide-react";

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => {
    async function fetchChallenge() {
      try {
        const res = await fetch(`/api/challenges/${id}`, {
          cache: "no-store",
        });
        const json = await res.json();
        setChallenge(json.challenge || null);
        if (json.challenge) {
          setEditData(json.challenge);
        }
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchChallenge();
  }, [id]);

  const handleUpdateChallenge = async () => {
    if (!editData.name?.trim()) {
      setToast({ type: "error", msg: "Le nom du challenge est requis" });
      return;
    }

    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Connexion requise");

      const res = await fetch(`/api/challenges/${id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setChallenge(json.challenge);
      setEditMode(false);
      setToast({ type: "success", msg: "Challenge mis à jour !" });
    } catch (e: any) {
      setToast({ type: "error", msg: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center text-red-400 p-4">
        Challenge non trouvé
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-300 ${toast.type === "success"
            ? "bg-emerald-600 text-white shadow-emerald-500/20"
            : "bg-red-600 text-white shadow-red-500/20"
            }`}
        >
          {toast.msg}
        </div>
      )}

      {editMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setEditMode(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-white">Modifier le challenge</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Nom</label>
                <Input
                  type="text"
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="bg-slate-900/50 border-white/10 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Mode</label>
                  <select
                    value={editData.mode || ""}
                    onChange={(e) => setEditData({ ...editData, mode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="solo">Solo</option>
                    <option value="flex">Flex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Visibilité</label>
                  <select
                    value={editData.visibility || ""}
                    onChange={(e) => setEditData({ ...editData, visibility: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="public">Public</option>
                    <option value="private">Privé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Règle de classement</label>
                <select
                  value={editData.ranking_rule || ""}
                  onChange={(e) => setEditData({ ...editData, ranking_rule: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="fresh_rank">Fresh Rank (Compte vierge)</option>
                  <option value="lp_gained">LP Gained (Progression pure)</option>
                  <option value="wins_losses">Wins/Losses (Ratio)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  onClick={handleUpdateChallenge}
                  disabled={saving}
                  className="flex-1 shadow-lg shadow-emerald-500/20"
                >
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setEditMode(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <LeaderboardClient
        id={id}
        challengeName={challenge.name}
        onSettingsClick={() => setEditMode(true)}
      />
    </div>
  );
}
