const { getAdminCredentials, getJsonBody, sendJson } = require("./_shared");

module.exports = async function adminLogin(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { message: "Method not allowed." });
    return;
  }

  try {
    const { email, password } = await getJsonBody(request);
    const admin = getAdminCredentials();

    if (email === admin.email && password === admin.password) {
      sendJson(response, 200, { token: admin.token });
      return;
    }

    sendJson(response, 401, { message: "Invalid admin email or password." });
  } catch (error) {
    sendJson(response, 500, { message: error.message || "Admin login failed." });
  }
};
