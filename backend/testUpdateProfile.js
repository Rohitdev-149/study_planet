(async () => {
  try {
    // Ensure Node 18+ (fetch available)
    const loginResp = await fetch("http://localhost:4000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "rohitdas7869@gmail.com",
        password: "Rohitd@s149",
      }),
    });
    const loginBody = await loginResp.json();
    console.log("LOGIN RESPONSE", loginBody);
    const token = loginBody.token;
    if (!token) {
      console.error("No token returned; aborting");
      return;
    }

    const updateResp = await fetch(
      "http://localhost:4000/api/v1/profile/update-profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dateOfBirth: "1990-01-01",
          about: "Test",
          contactNumber: "1234567890",
          gender: "Male",
        }),
      }
    );
    const updateBody = await updateResp.json();
    console.log("UPDATE RESPONSE", updateResp.status, updateBody);
  } catch (e) {
    console.error(e);
  }
})();
