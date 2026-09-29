import Logout from "./Logout";
import { useNavigate } from "react-router-dom";
import Notifications from "./Notifications";

function Header() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 z-20">
      <h1
        className="text-xl font-serif italic cursor-pointer"
        onClick={() => navigate("/feed")}
      >
        Postagram
      </h1>
      <div className="flex justify-center items-center gap-10">
        <button
          onClick={() => navigate(`/profile/${userId}`)}
          className="cursor-pointer"
        >
          <svg
            xmlns="http://w3.org"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        <button
          onClick={() => navigate("/search")}
          className="text-gray-400 text-lg leading-none cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <Notifications onClick={() => navigate("/notifications")} />
        <Logout />
      </div>
    </div>
  );
}

export default Header;
