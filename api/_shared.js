const DEFAULT_ADMIN_EMAIL = "tanveerhk.it@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "tanveerhkit";
const SITE_CONTENT_TABLE = "site_content";
const CONTACT_MESSAGES_TABLE = "contact_messages";
const SITE_CONTENT_ID = "main";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function getJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON request body."));
      }
    });

    request.on("error", reject);
  });
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured in Vercel environment variables.`);
  }

  return value;
}

function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
    token: getRequiredEnv("ADMIN_SESSION_TOKEN"),
  };
}

function getSupabaseConfig() {
  return {
    url: getRequiredEnv("SUPABASE_URL").replace(/\/$/, ""),
    serviceRoleKey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

async function supabaseRequest(path, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Supabase request failed.");
  }

  return data;
}

function getBearerToken(request) {
  const header = request.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

module.exports = {
  CONTACT_MESSAGES_TABLE,
  SITE_CONTENT_ID,
  SITE_CONTENT_TABLE,
  getAdminCredentials,
  getBearerToken,
  getJsonBody,
  sendJson,
  supabaseRequest,
};
