import nodemailer from "nodemailer"

export async function sendMailServices(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_EMAIL_ADDRESS,
      pass: process.env.NEXT_EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to,
    subject,
    text,
  });

  return info;
}