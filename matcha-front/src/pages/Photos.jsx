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
      .then((data) => setPhotos(data))
      .catch((err) => console.error(err));
  }, [token]);

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

      {photos.map((photo) => (
        <div key={photo.id}>
          <img
            src={`http://localhost:3000/${photo.url}`}
            alt="photo"
            width="150"
          />

          <button onClick={() => deletePhoto(photo.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}