// index.js
const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // your email
    pass: 'your-email-password',  // your email password
  },
});

app.post('/api/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

  // Validation
  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).send('All fields are required.');
  }

  try {
    // Save referral to the database
    const referral = await prisma.referral.create({
      data: { referrerName, referrerEmail, refereeName, refereeEmail },
    });

    // Send referral email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: refereeEmail,
      subject: 'You have been referred!',
      text: `Hi ${refereeName},\n\n${referrerName} has referred you for a course. Contact them at ${referrerEmail} for more details.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send('Error sending email.');
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(201).json(referral);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
