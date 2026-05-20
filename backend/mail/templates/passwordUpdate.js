exports.passwordUpdated=(email,name)=>{
return `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Updated Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            font-size: 16px;
            line-height: 1.4;
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
        }   
        .logo {
            margin-bottom: 20px;
        }
     .message {
            font-size: 18px;
            color: #555555;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .body{
            font
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
    </style>

</head>
<body>  
    <div class="container">
        <div class="header">
            <h1>Password Successfully Updated</h1>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>We wanted to let you know that your password has been successfully updated for the eamil <span class="highlight">${email}</span>. If you did not make this change, please contact our support team immediately.</p>
            <p>Thank you for being a valued member of our community!</p>
            <p>Best regards,<br>Study Planet</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
    </div>

</body>

</html>`;
};