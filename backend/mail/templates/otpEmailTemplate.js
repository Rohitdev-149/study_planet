module.exports = function otpEmailTemplate(otp) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
      <img src="https://raw.githubusercontent.com/youruser/studyplanet/main/public/assets/Logo.svg" alt="StudyPlanet" style="width: 200px; margin-bottom: 20px; background-color: #FFD60A; padding: 10px; border-radius: 8px;">
      
      <h1 style="color: #000; font-size: 24px; margin: 0 0 20px;">OTP Verification Email</h1>
      
      <p style="color: #000; font-size: 16px; margin-bottom: 20px;">Dear User,</p>
      
      <p style="color: #000; font-size: 16px; margin-bottom: 20px;">
        Thank you for registering with StudyPlanet. To complete your registration, please 
        use the following OTP (One-Time Password) to verify your account:
      </p>

      <div style="background-color: #F5F5F5; padding: 10px 20px; width: fit-content; margin: 20px auto; border-radius: 4px;">
        <span style="font-size: 26px; letter-spacing: 3px; font-weight: bold; color: #000;">${otp}</span>
      </div>

      <p style="color: #000; font-size: 14px; margin-bottom: 20px;">
        This OTP is valid for 5 minutes. If you did not request this verification, please 
        disregard this email. Once your account is verified, you will have access to our 
        platform and its features.
      </p>

      <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
        If you have any questions or need assistance, please feel free to reach out to us at
      </p>
      
      <a href="mailto:info@studyplanet.com" style="color: #2563EB; text-decoration: none;">info@studyplanet.com</a>
      
      <p style="color: #666; font-size: 14px;">We are here to help!</p>
    </div>
  `;
};
