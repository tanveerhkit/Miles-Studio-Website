const {
  CONTACT_MESSAGES_TABLE,
  getAdminCredentials,
  getBearerToken,
  getJsonBody,
  sendJson,
  supabaseRequest,
} = require("./_shared");

function validateContactMessage(body) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email || !message) {
    throw new Error("Name, email, and message are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  return {
    name: name.slice(0, 160),
    email: email.slice(0, 220),
    message: message.slice(0, 3000),
  };
}

function requireAdmin(request, response) {
  const admin = getAdminCredentials();
  const token = getBearerToken(request);

  if (!token || token !== admin.token) {
    sendJson(response, 401, { message: "Admin session expired. Please login again." });
    return false;
  }

  return true;
}

async function createContactMessage(request, response) {
  const body = await getJsonBody(request);
  const contactMessage = validateContactMessage(body);

  const rows = await supabaseRequest(CONTACT_MESSAGES_TABLE, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify([contactMessage]),
  });

  sendJson(response, 201, {
    message: "Thank you for reaching out! I will connect with you soon.",
    contactMessage: rows?.[0] || contactMessage,
  });
}

async function listContactMessages(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  const rows = await supabaseRequest(
    `${CONTACT_MESSAGES_TABLE}?select=id,name,email,message,created_at&order=created_at.desc&limit=50`,
    {
      method: "GET",
    }
  );

  sendJson(response, 200, { messages: rows || [] });
}

async function deleteContactMessage(request, response) {
  if (!requireAdmin(request, response)) {
    return;
  }

  const url = new URL(request.url, `https://${request.headers.host}`);
  const messageId = url.searchParams.get("id");

  if (!messageId) {
    sendJson(response, 400, { message: "Message id is required." });
    return;
  }

  await supabaseRequest(`${CONTACT_MESSAGES_TABLE}?id=eq.${encodeURIComponent(messageId)}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });

  sendJson(response, 200, { message: "Message deleted successfully." });
}

module.exports = async function contactApi(request, response) {
  try {
    if (request.method === "POST") {
      await createContactMessage(request, response);
      return;
    }

    if (request.method === "GET") {
      await listContactMessages(request, response);
      return;
    }

    if (request.method === "DELETE") {
      await deleteContactMessage(request, response);
      return;
    }

    sendJson(response, 405, { message: "Method not allowed." });
  } catch (error) {
    sendJson(response, 500, { message: error.message || "Contact API failed." });
  }
};
