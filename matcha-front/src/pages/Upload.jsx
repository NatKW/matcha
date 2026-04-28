import { useState } from "react";
import { apiFetch } from "../api/api";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Aucun fichier sélectionné");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const data = await apiFetch("/photos", "POST", formData);

      if (!data) return; // cas 403 déjà géré

      console.log("UPLOAD RESPONSE:", data);

      setMessage("✅ Upload réussi !");
      setFile(null);

    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de l'upload");
    }
  };

  return (
    <div>
      <h2>Upload photo</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        Upload
      </button>

      {/* 🔥 message utilisateur */}
      {message && <p>{message}</p>}
    </div>
  );
}