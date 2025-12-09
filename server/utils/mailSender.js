const nodemailer = require("nodemailer");

exports.mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT || 587,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    let info = await transporter.sendMail({
      from: "StudyPlanet",
      to: email,
      subject: title,
      html: body,
    });
    return info;
  } catch (error) {
    console.error("Error sending mail:", error);
    throw error;
  }
};
