import { useState } from "react";

export function useLogin() {
  const [found, setFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (user) => {
    setLoading(true);
    setError(null);
    setFound(false);

    try {
      const response = await fetch("http://localhost:5000/user");
      const data = await response.json();

      const exists = data.find(
        (u) =>
          u.username === user.username &&
          u.email === user.email &&
          u.password === user.password &&
          u.role === user.role,
      );

      setFound(!!exists);
      sessionStorage.setItem("UserId", exists.id);
      console.log(sessionStorage.getItem("UserId"));
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { login, found, loading, error };
}
