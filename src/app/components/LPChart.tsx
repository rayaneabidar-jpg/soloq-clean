// src/app/components/LPChart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

interface LPChartProps {
  challengeId: string;
  playerId?: string; // Si vide, affiche tous les joueurs
}

export default function LPChart({ challengeId, playerId }: LPChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const query = playerId ? `?playerId=${playerId}` : "";
        const res = await fetch(`/api/challenges/${challengeId}/lp-history${query}`);
        const json = await res.json();
        setData(json.history || []);
      } catch (e) {
        console.error("Error fetching LP history:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [challengeId, playerId]);

  if (loading) return <div className="text-center text-gray-400">Chargement...</div>;
  if (data.length === 0) return <div className="text-center text-gray-400">Pas de données</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis 
          dataKey="time" 
          stroke="#999"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#999"
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #444" }}
          labelStyle={{ color: "#fff" }}
        />
        <Legend />
        {/* Dynamiquement ajouter une Line par joueur */}
        {data && Object.keys(data)
          .filter(k => k !== "time")
          .map((player, i) => (
            <Line
              key={player}
              type="monotone"
              dataKey={player}
              stroke={["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][i % 5]}
              dot={false}
              strokeWidth={2}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
