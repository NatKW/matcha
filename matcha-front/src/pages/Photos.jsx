import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Photos() {
  const [photos, setPhotos] = useState([]);

  // 🔹 Charger les photos
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const data = await apiFetch("/photos");

        if (!data) return; // cas 403 → déjà géré

        console.log("PHOTOS DATA:", data);

        setPhotos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    loadPhotos();
  }, []);

  // 🔹 Like
  const [matchMessage, setMatchMessage] = useState(null);
  const likePhoto = async (photo_id) => {
    try {
      const data = await apiFetch("/likes", "POST", { photo_id });

      if (!data) return;

      console.log("LIKE RESPONSE:", data);

      if (data.match) {
        if (data.match) {
          setMatchMessage("🎉 It's a MATCH !");
          setTimeout(() => setMatchMessage(null), 5000);
        }
      }

    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Delete
  const deletePhoto = async (id) => {
    try {
      const res = await apiFetch(`/photos/${id}`, "DELETE");

      if (!res) return;

      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Galerie</h2>
      {/* 🔥 message match */}
    {matchMessage && <p>{matchMessage}</p>}

      {photos.map((photo) => (
        <div key={photo.id}>
          <img
            src={`http://localhost:3000/${photo.url}`}
            alt="photo"
            width="150"
          />

          <button onClick={() => likePhoto(photo.id)}>
            ❤️ Like
          </button>

          <button onClick={() => deletePhoto(photo.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}