import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // mora biti pozvan OVDE, pre korišćenja process.env

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yourmeditechcompany@gmail.com",
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendEmailToCustomer(email) {
  const text = `Thank you for shopping with SmartPharm.
    Your order has been received and will be processed soon!

    Kind Regards,
    SmartPharm Pharmacy`;

  const mailOptions = {
    from: "yourmeditechcompany@gmail.com",
    to: email,
    subject: "Thank You for Your Order",
    text,
  };

  try {
    const response = await transporter.sendMail(mailOptions);
    console.log("Customer email sent:", response.response);
  } catch (err) {
    console.error("Error sending customer email:", err);
  }
}

export async function sendEmailToCompany(user, userCart, cartItems, details) {
  let text = `New order has arrived!

    Customer Email: ${user.email}
    Customer Address: ${details.address}, ${details.city}
    Customer Phone Number: ${details.phone}

    Products ordered:
    `;

  cartItems.forEach((item) => {
    text += `- ${item.label} x ${item.quantity}\n`;
  });

  text += `\nTotal Price: ${userCart.totalprice} $`;

  const mailOptions = {
    from: "yourmeditechcompany@gmail.com",
    to: "yourmeditechcompany@gmail.com",
    subject: "New Order",
    text,
  };

  try {
    const response = await transporter.sendMail(mailOptions);
    console.log("Company email sent:", response.response);
  } catch (err) {
    console.error("Error sending company email:", err);
  }
}
