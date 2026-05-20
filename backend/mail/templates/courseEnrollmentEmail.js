exports.courseEnrollmentEmail = (name, courseName) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Course Enrollment Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      text-align: center;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border-radius: 10px;
    }
    .message {
      font-size: 18px;
      color: #555555;
      margin-bottom: 20px;
    }
    .course-name {
      font-size: 20px;
      font-weight: bold;
      color: #007BFF;
      margin-bottom: 20px;
    }
    .support {
      font-size: 14px;
      color: #888888;
      margin-top: 20px;
    }
    .highlight {
      color: #007BFF;
      font-weight: bold;
    }
    .btn {
      display: inline-block;
      margin-top: 25px;
      padding: 12px 25px;
      font-size: 16px;
      color: #ffffff;
      background-color: #007BFF;
      border-radius: 5px;
      text-decoration: none;
      transition: background-color 0.3s ease;
    }
    .btn:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Course Enrollment Successful</h1>
    </div>
    <div class="content">
      <p class="message">Dear ${name},</p>
      <p class="message">Congratulations! You have been successfully enrolled in the course:</p>
      <p class="course-name">${courseName}</p>
      <p class="message">We are excited to have you on board and look forward to your learning journey with us.</p>
      <p class="message">If you have any questions or need assistance, please feel free to reach out to our support team.</p>
      
      <!-- Go to Dashboard Button -->
      <a href="https://studyplanet.com/dashboard" class="btn">Go to Dashboard</a>
    </div>
    <div class="support">
      <p>Best regards,</p>
      <p>Study Planet Support Team</p>
      <p>Email:
        <a href="mailto:infostudyplanet.com" class="highlight">infostudyplanet.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
};
