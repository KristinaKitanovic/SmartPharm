import { useState, useEffect } from "react";
import LogoImg from "../assets/images/pharmacylogo.png";
import { useLogin } from "../utils/hooks/useLogin";
import "../styles/Login.scss";
import { useNavigate } from "react-router-dom";

export function PharmacystLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "P",
  });
  const [submitted, setSubmitted] = useState(false);

  const { login, found, loading, error } = useLogin();

  useEffect(() => {
    if (found) {
      navigate("/PharmacystDashboard");
    }
  }, [found]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    login(formData);
  };

  return (
    <div>
      <div className="mainWindow">
        <div className="leftHalf">
          <div className="logoContainer">
            <img src={LogoImg} />
          </div>
          <div className="registerContainer">
            <p>Don't have an account?</p>
            <button onClick={() => navigate("/PharmacystRegister")}>
              Register
            </button>
          </div>
        </div>
        <div className="rightHalf">
          <p className="heading">Pharmacyst Login</p>
          <form className="inputFields" onSubmit={handleSubmit}>
            <div className="usernameInput">
              <p>Username</p>
              <input
                type="text"
                placeholder="Enter Username"
                value={formData.Username}
                onChange={(e) => {
                  setFormData((current) => ({
                    ...current,
                    username: e.target.value,
                  }));
                }}
                required
              />
            </div>
            <div className="emailInput">
              <p>Email</p>
              <input
                type="email"
                placeholder="Enter Email"
                value={formData.Email}
                onChange={(e) => {
                  setFormData((current) => ({
                    ...current,
                    email: e.target.value,
                  }));
                }}
                required
              />
            </div>
            <div className="passwordInput">
              <p>Password</p>
              <input
                type="password"
                placeholder="Enter Password"
                value={formData.Password}
                onChange={(e) => {
                  setFormData((current) => ({
                    ...current,
                    password: e.target.value,
                  }));
                }}
                required
              />
            </div>
            <button type="submit" className="loginButton">
              {loading ? "Logging in..." : "Login"}
            </button>
            {error && <p className="errorMessage">{error}</p>}
            {!error && !found && !loading && submitted && (
              <p className="errorMessage">This Account doesn't exist</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
