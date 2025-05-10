import { useState } from "react";

export function useRegister() {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usernameExists, setusernameExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const register = async (newUser) => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setRegistered(false);
    setusernameExists(false);
    setEmailExists(false);

    try {
      let response = await fetch("http://localhost:5000/user", {
        signal: controller.signal,
      });
      const data = await response.json();

      const usernameTaken = data.find(
        (u) => u.username === newUser.username && u.role === newUser.role,
      );
      const emailTaken = data.find(
        (u) => u.email === newUser.email && u.role === newUser.role,
      );
      setusernameExists(!!usernameTaken);
      setEmailExists(!!emailTaken);

      if (!usernameTaken && !emailTaken) {
        response = await fetch("http://localhost:5000/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
        if (!response.ok) {
          throw new Error("Registration went wrong.");
        }

        const responseData = await response.json();
        setRegistered(true);
        sessionStorage.setItem("UserId", responseData.id);

        if (newUser.role === "C") {
          response = await fetch("http://localhost:5000/usercart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userid: sessionStorage.getItem("UserId"),
              originalprice: 0,
              totalprice: 0,
            }),
          });
          response = await fetch("http://localhost:5000/usermessagesummary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userid: sessionStorage.getItem("UserId"),
              username: newUser.username,
              unreadcount: 0,
              lastmessagetime: "",
            }),
          });
        }

        console.log("pri registrovanju : ", sessionStorage.getItem("UserId"));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };
  return { register, registered, loading, error, usernameExists, emailExists };
}
