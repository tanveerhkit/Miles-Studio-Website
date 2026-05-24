const store = window.MilesStudioStore;
const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");

function showLoginStatus(message, isError = false) {
  loginStatus.textContent = message;
  loginStatus.hidden = false;
  loginStatus.classList.toggle("error", isError);
}

async function redirectIfAlreadyLoggedIn() {
  if (await store.isAdminLoggedIn()) {
    window.location.replace("../dashboard/index.html");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const submitButton = loginForm.querySelector("button[type='submit']");

  submitButton.disabled = true;
  submitButton.textContent = "Checking...";

  if (await store.loginAdmin(email, password)) {
    showLoginStatus("Login successful. Opening dashboard...");
    window.location.href = "../dashboard/index.html";
    return;
  }

  showLoginStatus(
    store.getLastAdminLoginError() || "Invalid admin email or password.",
    true
  );
  submitButton.disabled = false;
  submitButton.textContent = "Login";
});

redirectIfAlreadyLoggedIn();
