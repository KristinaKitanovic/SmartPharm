import express from "express";
import cors from "cors";
import { sendEmailToCustomer, sendEmailToCompany } from "./mailer.mjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta za slanje emaila korisniku
app.post("/send-email-to-customer", async (req, res) => {
  const { email } = req.body;
  try {
    // Pozivanje funkcije za slanje emaila korisniku
    await sendEmailToCustomer(email);
    res.status(200).send("Email sent to customer");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending email to customer");
  }
});

// Ruta za slanje emaila kompaniji
app.post("/send-email-to-company", async (req, res) => {
  const { user, userCart, cartItems, details } = req.body;
  try {
    // Pozivanje funkcije za slanje emaila kompaniji
    await sendEmailToCompany(user, userCart, cartItems, details);
    res.status(200).send("Email sent to company");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending email to company");
  }
});

// Startovanje servera
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
