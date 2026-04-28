import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [matchMessage, setMatchMessage] = useState(null);

  useEffect(() => {
    const loadPhotos = async () => {
      const data = await apiFetch("/photos");
      if (!data) return;

      console.log("PHOTOS DATA:", data);
      setPhotos(Array.isArray(data) ? data : []);
    };

    loadPhotos();
  }, []);

  const likePhoto = async (photo_id) => {
    const data = await apiFetch("/likes", "POST", { photo_id });
    if (!data) return;

    if (data.match) {
      setMatchMessage("🔥 MATCH !");
      setTimeout(() => setMatchMessage(null), 3000);
    }
  };

  const deletePhoto = async (id) => {
    await apiFetch(`/photos/${id}`, "DELETE");
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
  <div style={pageStyle}>
    <h2>Galerie</h2>

    {matchMessage && (
      <p style={matchStyle}>{matchMessage}</p>
    )}

    <div style={gridStyle}>
      {photos.map((photo) => (
        <div key={photo.id} style={cardStyle}>
          <img
            src={`http://localhost:3000${photo.url}`}
            style={imageStyle}
          />

          <div style={bandStyle} />

          <div style={actionsStyle}>
            <button onClick={() => likePhoto(photo.id)} style={likeStyle}>
              ❤️
            </button>

            <button onClick={() => deletePhoto(photo.id)} style={deleteStyle}>
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
}

/* 🎨 STYLES */

const pageStyle = {
  padding: "20px",
  minHeight: "100vh",
  background: "linear-gradient(180deg, #fff, #fff5f6)",
  fontFamily: "'Poppins', sans-serif",
};

const titleStyle = {
  color: "#333",
  fontWeight: "600",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "20px",
};

const cardStyle = {
  background: "#FFFFFF",
  padding: "10px 10px 40px 10px",
  borderRadius: "12px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  position: "relative",
  transition: "transform 0.2s ease",
};

const imageStyle = {
  width: "100%",
  height: "220px",
  objectFit: "cover",
  borderRadius: "6px",
  border: "6px solid white",
};

const bandStyle = {
  height: "18px",
  background: "#EAEAEA",
  marginTop: "10px",
  borderRadius: "4px",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px",
};

const likeStyle = {
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  background: "transparent",
};

const deleteStyle = {
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
  background: "transparent",
  opacity: 0.6,
};