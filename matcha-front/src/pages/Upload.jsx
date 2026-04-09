import { useState } from "react";
import { apiFetch } from "../api/api";

export default function Upload({ token }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", file);

    const data = await apiFetch("/photos", "POST", formData, token);

    console.log(data);
  };

  return (
    <div>
      <h2>Upload Photo</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}