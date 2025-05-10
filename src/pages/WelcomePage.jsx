import "../styles/WelcomePage.scss";
import welcomeImg from "../assets/images/welcomepage.png";
import { useNavigate } from "react-router-dom";

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="header">
        <p className="SPLabel">SMARTPHARM</p>
      </div>
      <div className="mainPic">
        <img src={welcomeImg}></img>
        <div className="loginButtons">
          <div className="customer">
            <p>
              Log in to manage your prescriptions and easily access the
              medications you need, all tailored to you as a customer
            </p>
            <button onClick={() => navigate("/CustomerLogin")}>
              Customer Login
            </button>
          </div>
          <div className="pharmacyst">
            <p>
              Log in to assist customers, manage prescriptions, and provide
              expert care as a pharmacist
            </p>
            <button onClick={() => navigate("/PharmacystLogin")}>
              Pharmacyst Login
            </button>
          </div>
        </div>
      </div>
      <div className="researchContainer">
        <p>Discover Our Research</p>
        <div className="research">
          <p>
            At SmartPharm, we are committed to advancing the field of pharmacy
            through innovative research and development. Our dedicated team of
            experts works tirelessly to explore new treatments, improve patient
            care, and revolutionize the way medications are prescribed and
            managed. Explore our latest findings and discover how we are shaping
            the future of healthcare.
          </p>
        </div>
      </div>
    </>
  );
}
