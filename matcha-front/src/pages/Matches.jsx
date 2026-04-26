import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Matches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await apiFetch("/matches");

        if (!data) return;

        console.log("MATCHES:", data);
        setMatches(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadMatches();
  }, []);

  return (
    <div>
      <h2>🔥 Mes matchs</h2>

      {matches.length === 0 && <p>Aucun match pour le moment</p>}

      {matches.map((match) => (
        <div key={match.id}>
          <p>👤 {match.username}</p>

          <button>
            💬 Message
          </button>
        </div>
      ))}
    </div>
  );
}