const nodemailer = require("nodemailer");

const { EmailTemplate } = require("@models/index");
const { email } = require("@config/config");

const transporter = nodemailer.createTransport({
  service: email.emailService,
  port: parseInt(email.emailPort, 10),
  auth: {
    user: email.emailUser,
    pass: email.emailPassword,
  },
});

function replacePlaceholders(template, data) {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

async function sendMail(to, templateSlug, data = {}) {
  const template = await EmailTemplate.findOne({
    where: {
      slug: templateSlug,
      status: true,
    },
  });

  if (!template)
    throw new Error(`Email template '${templateSlug}' not found or inactive.`);

  const html = replacePlaceholders(template.body, data);

  const mailOptions = {
    from: `"Your App Name" <${email.emailUser}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
