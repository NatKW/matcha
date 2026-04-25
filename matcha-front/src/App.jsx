import { useState } from "react";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import Photos from "./pages/Photos";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <>
      <button onClick={handleLogout}>Logout</button>
      <Upload token={token} />
      <Photos token={token} />
    </>
  );
}

export default App;