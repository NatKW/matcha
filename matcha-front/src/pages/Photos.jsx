import { useEffect, useState } from "react";

export default function Photos({ token }) {
  const [photos, setPhotos] = useState([]);

useEffect(() => {
  fetch("http://localhost:3000/api/photos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("PHOTOS DATA:", data);

      if (Array.isArray(data)) {
        setPhotos(data);
      } else {
        console.error("Erreur API:", data);
        setPhotos([]); // 🔥 évite crash
      }
    })
    .catch((err) => console.error(err));
}, [token]);

const likePhoto = async (photo_id) => {
  try {
    const res = await fetch("http://localhost:3000/api/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ photo_id }),
    });

    const data = await res.json();

    console.log("LIKE RESPONSE:", data);

    if (data.match) {
      alert("🔥 MATCH !");
    }

  } catch (err) {
    console.error(err);
  }
};

const deletePhoto = async (id) => {
  try {
    await fetch(`http://localhost:3000/api/photos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setPhotos((prev) => prev.filter((p) => p.id !== id));
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div>
      <h2>Galerie</h2>

      {Array.isArray(photos) &&
        photos.map((photo) => (
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