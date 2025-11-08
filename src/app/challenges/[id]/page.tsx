"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LeaderboardClient from "@/app/components/LeaderboardClient";

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
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
    <div className="space-y-8">
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {editMode && (
        <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700 text-white">
          <h2 className="text-2xl font-bold mb-4">Modifier le challenge</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom</label>
              <input
                type="text"
                value={editData.name || ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mode</label>
              <select
                value={editData.mode || ""}
                onChange={(e) => setEditData({ ...editData, mode: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="solo">Solo</option>
                <option value="flex">Flex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ranking Rule</label>
              <select
                value={editData.ranking_rule || ""}
                onChange={(e) => setEditData({ ...editData, ranking_rule: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="fresh_rank">Fresh Rank</option>
                <option value="lp_gained">LP Gained</option>
                <option value="wins_losses">Wins/Losses</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Visibilité</label>
              <select
                value={editData.visibility || ""}
                onChange={(e) => setEditData({ ...editData, visibility: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="public">Public</option>
                <option value="private">Privé</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpdateChallenge}
                disabled={saving}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 rounded text-white font-medium"
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {!editMode && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">{challenge.name}</h1>
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium"
            >
              Modifier
            </button>
          </div>
        </div>
      )}

      <LeaderboardClient id={id} />
    </div>
  );
}
