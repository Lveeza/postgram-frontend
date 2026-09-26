import { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/login", { email, password });
      const token = response.data.access_token;
      localStorage.setItem("token", token);

      const userResponse = await api.get("/user");
      localStorage.setItem("userId", userResponse.data.id);
      localStorage.setItem("userName", userResponse.data.name);

      navigate("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-[350px] px-4">
        {/* Card */}
        <div className="bg-white border border-gray-300 rounded-lg px-10 py-10">
          <h1 className="text-center text-4xl font-serif italic mb-8">
            Postagram
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
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

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold
                         text-sm rounded-lg py-1.5 mt-3 transition-colors"
            >
              Log In
            </button>
          </form>
        </div>

        {/* Signup box */}
        <div className="bg-white border border-gray-300 rounded-sm mt-3 py-5 text-center">
          <p className="text-sm">
            Don't have an account?{" "}
            <span
              className="text-blue-500 font-semibold cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;