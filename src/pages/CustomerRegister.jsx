import { useNavigate } from "react-router-dom";
import { useRegister } from "../utils/hooks/useRegister";
import { useState, useEffect } from "react";
import LogoImg from "../assets/images/pharmacylogo.png";
import "../styles/Login.scss";

export function CustomerRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "C",
  });

  const { register, registered, loading, error, usernameExists, emailExists } =
    useRegister();

  useEffect(() => {
    if (registered) {
      navigate("/CustomerShop");
    }
  }, [registered]);

  const handleSubmit = (e) => {
    e.preventDefault();
    register(formData);
  };

  return (
    <div>
      <div className="mainWindow">
        <div className="leftHalf">
          <div className="logoContainer">
            <img src={LogoImg} />
          </div>
          <div className="thanks">
            <p>Thank You for choosing SmartPharm!</p>
          </div>
        </div>
        <div className="rightHalf">
          <p className="heading">Customer Registration</p>
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
            {usernameExists && (
              <p className="errorMessage">
                This Username is already taken. Try another one.
              </p>
            )}
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
            {emailExists && (
              <p className="errorMessage">
                This Email is already taken. Try another one.
              </p>
            )}
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
              {loading ? "Loading..." : "Register"}
            </button>
            {error && <p className="errorMessage">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
