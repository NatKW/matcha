import { useState } from "react";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  <button onClick={() => {
  localStorage.removeItem("token");
  setToken(null);
}}>
  Logout
</button>

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return <Upload token={token} />;
}

export default App;
