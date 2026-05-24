const {
  SITE_CONTENT_ID,
  SITE_CONTENT_TABLE,
  getAdminCredentials,
  getBearerToken,
  getJsonBody,
  sendJson,
  supabaseRequest,
} = require("./_shared");

async function getContent(response) {
  const rows = await supabaseRequest(
    `${SITE_CONTENT_TABLE}?id=eq.${SITE_CONTENT_ID}&select=content`,
    {
      method: "GET",
      headers: {
        Prefer: "return=representation",
      },
    }
  );

  sendJson(response, 200, {
    content: rows?.[0]?.content || null,
  });
}

async function updateContent(request, response) {
  const admin = getAdminCredentials();
  const token = getBearerToken(request);

  if (!token || token !== admin.token) {
    sendJson(response, 401, { message: "Admin session expired. Please login again." });
    return;
  }

  const { content } = await getJsonBody(request);

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    sendJson(response, 400, { message: "A valid content object is required." });
    return;
  }

  await supabaseRequest(`${SITE_CONTENT_TABLE}?on_conflict=id`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify([
      {
        id: SITE_CONTENT_ID,
        content,
        updated_at: new Date().toISOString(),
      },
    ]),
  });

  sendJson(response, 200, { content });
}

module.exports = async function contentApi(request, response) {
  try {
    if (request.method === "GET") {
      await getContent(response);
      return;
    }

    if (request.method === "PUT") {
      await updateContent(request, response);
      return;
    }

    sendJson(response, 405, { message: "Method not allowed." });
  } catch (error) {
    sendJson(response, 500, { message: error.message || "Content API failed." });
  }
};
