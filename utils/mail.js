const nodemailer = require("nodemailer");

const { EmailTemplate } = require("@models/index");
const { email } = require("@config/config");

const transporter = nodemailer.createTransport({
  host: email.emailHost,
  port: 465,
  secure: true,
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

async function sendMail(to, templateSlug, subjectData, data = {}) {
  console.log(to, templateSlug, data);

  const template = await EmailTemplate.findOne({
    where: {
      slug: templateSlug,
      status: true,
    },
  });

  if (!template)
    throw new Error(`Email template '${templateSlug}' not found or inactive.`);

  const subject = replacePlaceholders(template.subject, subjectData);
  const html = replacePlaceholders(template.body, data);

  const mailOptions = {
    from: `${data.company_name} <${email.emailUser}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
