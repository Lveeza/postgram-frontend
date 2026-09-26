import api from "./api";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();
  const handleLogout = async () => {
  try {
    await api.post("/logout");
  } catch (err) {
    console.error("Logout request failed", err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
  }
};

  return <button onClick={handleLogout}>Logout</button>;
}
export default Logout;
