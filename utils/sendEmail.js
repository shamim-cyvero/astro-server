import { createTransport } from "nodemailer";

const sendEmail = async (subject, email, message) => {
  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE, 
    auth: {
      user: process.env.SMTP_SENDER_EMAIL,
      pass: process.env.SMTP_SENDER_PASS,
    },
  });

  await transport.sendMail({
    subject,
    from: process.env.SMTP_SENDER_EMAIL,
    to: email,
    text: message,
  });
};

export default sendEmail;
