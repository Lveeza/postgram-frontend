import { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-[350px] px-4">
        {/* Card */}
        <div className="bg-white border border-gray-300 rounded-lg px-10 py-10">
          <h1 className="text-center text-4xl font-serif italic mb-2">
            Postagram
          </h1>
          <p className="text-center text-gray-500 font-semibold text-sm mb-6">
            Sign up to see photos and videos from your friends.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="bg-gray-50 border border-gray-300 rounded-sm px-2 py-2 text-sm
                         focus:outline-none focus:border-gray-400"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-gray-50 border border-gray-300 rounded-sm px-2 py-2 text-sm
                         focus:outline-none focus:border-gray-400"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-gray-50 border border-gray-300 rounded-sm px-2 py-2 text-sm
                         focus:outline-none focus:border-gray-400"
            />

            {error && (
              <p className="text-red-500 text-xs text-center mt-1">{error}</p>
            )}

            <p className="text-xs text-gray-500 text-center mt-2">
              By signing up, you agree to our Terms, Privacy Policy and
              Cookies Policy.
            </p>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold
                         text-sm rounded-lg py-1.5 mt-2 transition-colors"
            >
              Sign up
            </button>
          </form>
        </div>

        {/* Login box */}
        <div className="bg-white border border-gray-300 rounded-sm mt-3 py-5 text-center">
          <p className="text-sm">
            Have an account?{" "}
            <span
              className="text-blue-500 font-semibold cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;