// index.js
const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

exports.handler = async (event) => {
  try {
    console.log("Lambda function started.");
    console.log('Received event:', event);
    
    // Parse the event payload
    const email_data = event;
    console.log("Event body parsed successfully:", email_data);

    // Ensure all required email fields are present
    if (!email_data.to || !email_data.subject || !email_data.text || !email_data.html) {
      console.error("Missing required email fields.");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required email fields." })
      };
    }

    // Configure email options
    const mailOptions = {
      from: process.env.GMAIL_USERNAME,
      to: email_data.to,
      subject: email_data.subject,
      text: email_data.text,
      html: email_data.html
    };
    
    console.log("Email options configured:", mailOptions);

    // Send email
    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully. Message info:", info);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully.", info })
    };
  } catch (error) {
    console.error("Error sending email:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error sending email.", error: error.message })
    };
  }
};
