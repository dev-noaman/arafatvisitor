import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

async function testSmtp() {
  const config = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: 'info@arafatvisitor.cloud', // Test sender
  };

  console.log('SMTP Configuration:');
  console.log('  Host:', config.host);
  console.log('  Port:', config.port);
  console.log('  User:', config.user);
  console.log('  From:', config.from);
  console.log('');

  if (!config.host || !config.port || !config.user || !config.pass) {
    console.error('Missing SMTP configuration in .env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  console.log('Testing SMTP connection...');

  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully!');
  } catch (err) {
    console.error('SMTP connection failed:', err);
    process.exit(1);
  }

  // Send test email
  const testRecipient = process.argv[2] || 'adel.noaman@arafatgroup.com';

  console.log(`\nSending test email to: ${testRecipient}`);

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: testRecipient,
      subject: 'SMTP Test - Arafat Visitor System',
      html: `
        <h2>SMTP Test Successful</h2>
        <p>This is a test email from the Arafat Visitor Management System.</p>
        <p><strong>Sender:</strong> ${config.from}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
      text: `SMTP Test Successful\n\nThis is a test email from the Arafat Visitor Management System.\nSender: ${config.from}\nTimestamp: ${new Date().toISOString()}`,
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('Failed to send email:', err);
    process.exit(1);
  }
}

testSmtp();
