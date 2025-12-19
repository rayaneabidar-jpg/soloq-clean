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
    <div className="w-full">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight">Paramètres du challenge</h2>
              <button
                onClick={() => setEditMode(false)}
                className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Nom */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Nom du challenge</label>
                <Input
                  type="text"
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="bg-[#0a0a0a] border-white/10 focus:border-[var(--color-green-start)] h-11"
                  placeholder="Ex: KC Fans 2025"
                />
              </div>

              {/* Grid Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visibilité */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Visibilité</label>
                  <div className="relative">
                    <select
                      value={editData.visibility || ""}
                      onChange={(e) => setEditData({ ...editData, visibility: e.target.value })}
                      className="w-full appearance-none bg-[#0a0a0a] border border-white/10 text-white rounded-lg px-4 h-11 focus:outline-none focus:border-[var(--color-green-start)] transition-colors pr-10 cursor-pointer"
                    >
                      <option value="public">Challenge Public</option>
                      <option value="private">Accès Privé</option>
                      <option value="unlisted">Non répertorié</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Date de début</label>
                  <Input
                    type="datetime-local"
                    value={editData.start_at ? new Date(editData.start_at).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditData({ ...editData, start_at: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 focus:border-[var(--color-green-start)] h-11 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Date de fin</label>
                  <Input
                    type="datetime-local"
                    value={editData.end_at ? new Date(editData.end_at).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditData({ ...editData, end_at: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 focus:border-[var(--color-green-start)] h-11 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setEditMode(false)}
                className="text-white/60 hover:text-white"
              >
                Annuler
              </Button>
              <Button
                variant="green"
                onClick={handleUpdateChallenge}
                disabled={saving}
                className="px-8 shadow-lg shadow-[var(--color-green-start)]/20"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sauvegarde...</span>
                  </div>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <LeaderboardClient
        id={id}
        challengeName={challenge.name}
        onSettingsClick={() => setEditMode(true)}
        onDeleteClick={async () => {
          if (!confirm("Êtes-vous sûr de vouloir supprimer ce challenge ? Cette action est irréversible.")) return;

          try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            if (!token) throw new Error("Connexion requise");

            const res = await fetch(`/api/challenges/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              const json = await res.json();
              throw new Error(json.error || "Erreur lors de la suppression");
            }

            setToast({ type: "success", msg: "Challenge supprimé avec succès" });
            setTimeout(() => {
              router.push("/challenges");
            }, 1000);
          } catch (e: any) {
            setToast({ type: "error", msg: e.message });
          }
        }}
      />
    </div>
  );
}
