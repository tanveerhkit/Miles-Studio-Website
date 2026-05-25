const store = window.MilesStudioStore;

let content = store.getSiteContent();

const statusEl = document.querySelector("#dashboard-status");
const logoutButton = document.querySelector("#logout-button");
const contentForm = document.querySelector("#content-form");
const guestForm = document.querySelector("#guest-form");
const upcomingForm = document.querySelector("#upcoming-form");
const guestList = document.querySelector("#guest-list");
const upcomingList = document.querySelector("#upcoming-list");
const messageList = document.querySelector("#message-list");
const navLinks = document.querySelectorAll(".admin-nav-link");
let contactMessages = [];

function getField(id) {
  return document.querySelector(`#${id}`);
}

function getValue(id) {
  return getField(id).value.trim();
}

function setValue(id, value) {
  getField(id).value = value || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.hidden = false;
  statusEl.classList.toggle("error", isError);

  window.clearTimeout(showStatus.timeoutId);
  showStatus.timeoutId = window.setTimeout(() => {
    statusEl.hidden = true;
  }, isError ? 9000 : 3600);
}

function setText(id, value) {
  const element = getField(id);
  if (element) {
    element.textContent = value;
  }
}

async function saveContent(message) {
  content = store.saveSiteContent(content);
  renderDashboard();

  try {
    content = await store.saveSharedContent(content);
    renderDashboard();
    showStatus(message);
    return true;
  } catch (error) {
    showStatus(
      `Saved in this browser, but could not publish live: ${
        error.message || "Content could not be saved."
      }`,
      true
    );
    return false;
  }
}

function renderSmallAvatar(item) {
  const name = item.name || item.guestName || "Miles Studio";
  const initials = item.initials || store.getInitials(name);
  const accentClass = item.accentClass || "accent-red";

  if (item.imageUrl) {
    return `
      <div class="admin-item-avatar">
        <img src="${escapeAttribute(item.imageUrl)}" alt="${escapeAttribute(name)}" />
      </div>
    `;
  }

  return `
    <div class="admin-item-avatar ${escapeAttribute(accentClass)}" aria-hidden="true">
      ${escapeHtml(initials)}
    </div>
  `;
}

function fillContentForm() {
  setValue("hero-eyebrow-field", content.hero.eyebrow);
  setValue("hero-title-field", content.hero.title);
  setValue("hero-subtitle-field", content.hero.subtitle);

  setValue("featured-name-field", content.featuredPodcast.guestName);
  setValue("featured-description-field", content.featuredPodcast.description);
  setValue("featured-video-field", content.featuredPodcast.videoUrl);
  setValue("featured-episode-field", content.featuredPodcast.episodeUrl);
  setValue("featured-image-field", content.featuredPodcast.imageUrl);
  setValue("featured-accent-field", content.featuredPodcast.accentClass);

  setValue("about-title-field", content.about.title);
  setValue("about-content-field", content.about.content);

  setValue("contact-heading-field", content.contact.heading);
  setValue("contact-intro-field", content.contact.intro);
  setValue("contact-email-field", content.contact.email);
  setValue("contact-youtube-field", content.contact.youtubeUrl);
  setValue("contact-linkedin-field", content.contact.linkedInUrl);
  setValue("contact-whatsapp-field", content.contact.whatsappUrl);
}

function renderFeaturedSourceOptions() {
  const select = getField("featured-source-field");
  const options = content.podcastGuests
    .map(
      (guest) =>
        `<option value="${escapeAttribute(guest.id)}">${escapeHtml(guest.name)} - ${escapeHtml(
          guest.title
        )}</option>`
    )
    .join("");

  select.innerHTML = `<option value="">Select a podcast guest</option>${options}`;
}

function renderStats() {
  const publishedCount = content.upcomingGuests.filter(
    (guest) => guest.status === "Published"
  ).length;

  setText("guest-count", content.podcastGuests.length);
  setText("upcoming-count", content.upcomingGuests.length);
  setText("featured-stat-name", content.featuredPodcast.guestName || "-");
  setText("published-count", publishedCount);
  setText("message-count", contactMessages.length);
}

function resetGuestForm() {
  guestForm.reset();
  setValue("guest-id-field", "");
  setValue("guest-accent-field", "accent-red");
  getField("guest-save-button").textContent = "Add Guest";
  setText("guest-editor-title", "Add Podcast Guest");
}

function fillGuestForm(guest) {
  setValue("guest-id-field", guest.id);
  setValue("guest-name-field", guest.name);
  setValue("guest-title-field", guest.title);
  setValue("guest-description-field", guest.description);
  setValue("guest-image-field", guest.imageUrl);
  setValue("guest-video-field", guest.videoUrl);
  setValue("guest-accent-field", guest.accentClass);
  getField("guest-save-button").textContent = "Save Guest";
  setText("guest-editor-title", `Edit ${guest.name}`);
  guestForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetUpcomingForm() {
  upcomingForm.reset();
  setValue("upcoming-id-field", "");
  setValue("upcoming-status-field", "Coming Soon");
  getField("upcoming-save-button").textContent = "Add Upcoming Guest";
  setText("upcoming-editor-title", "Add Upcoming Guest");
}

function fillUpcomingForm(guest) {
  setValue("upcoming-id-field", guest.id);
  setValue("upcoming-name-field", guest.name);
  setValue("upcoming-topic-field", guest.topic);
  setValue("upcoming-date-label-field", guest.dateLabel);
  setValue("upcoming-date-iso-field", guest.dateIso);
  setValue("upcoming-status-field", guest.status);
  getField("upcoming-save-button").textContent = "Save Upcoming Guest";
  setText("upcoming-editor-title", `Edit ${guest.name}`);
  upcomingForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderGuestList() {
  if (!content.podcastGuests.length) {
    guestList.innerHTML = `<p class="admin-list-copy">No podcast guests yet. Add your first guest above.</p>`;
    return;
  }

  guestList.innerHTML = content.podcastGuests
    .map(
      (guest) => `
        <article class="admin-list-item" data-guest-id="${escapeAttribute(guest.id)}">
          ${renderSmallAvatar(guest)}
          <div>
            <h3>${escapeHtml(guest.name)}</h3>
            <p>${escapeHtml(guest.title)}</p>
            <p>${escapeHtml(guest.description)}</p>
          </div>
          <div class="admin-item-actions">
            <button class="admin-mini-button" type="button" data-action="feature-guest">
              Set Featured
            </button>
            <button class="admin-mini-button" type="button" data-action="edit-guest">Edit</button>
            <button class="admin-mini-button danger" type="button" data-action="delete-guest">
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderUpcomingList() {
  if (!content.upcomingGuests.length) {
    upcomingList.innerHTML = `<p class="admin-list-copy">No upcoming guests yet. Add your first upcoming guest above.</p>`;
    return;
  }

  upcomingList.innerHTML = content.upcomingGuests
    .map(
      (guest) => `
        <article class="admin-list-item" data-upcoming-id="${escapeAttribute(guest.id)}">
          <div class="admin-item-avatar accent-ink" aria-hidden="true">
            ${escapeHtml(store.getInitials(guest.name))}
          </div>
          <div>
            <h3>${escapeHtml(guest.name)}</h3>
            <p>${escapeHtml(guest.topic)}</p>
            <p>${escapeHtml(guest.dateLabel)} - ${escapeHtml(guest.status)}</p>
          </div>
          <div class="admin-item-actions">
            <button class="admin-mini-button" type="button" data-action="edit-upcoming">Edit</button>
            <button class="admin-mini-button danger" type="button" data-action="delete-upcoming">
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

function formatMessageDate(value) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderMessageList() {
  if (!contactMessages.length) {
    messageList.innerHTML = `<p class="admin-list-copy">No contact messages yet.</p>`;
    return;
  }

  messageList.innerHTML = contactMessages
    .map(
      (message) => `
        <article class="admin-list-item admin-message-item" data-message-id="${escapeAttribute(
          message.id
        )}">
          <div class="admin-item-avatar accent-teal" aria-hidden="true">
            ${escapeHtml(store.getInitials(message.name))}
          </div>
          <div>
            <h3>${escapeHtml(message.name)}</h3>
            <p class="admin-message-meta">
              <a href="mailto:${escapeAttribute(message.email)}">${escapeHtml(message.email)}</a>
              <span>${escapeHtml(formatMessageDate(message.created_at))}</span>
            </p>
            <p>${escapeHtml(message.message)}</p>
          </div>
          <div class="admin-item-actions">
            <a class="admin-mini-link" href="mailto:${escapeAttribute(message.email)}">Reply</a>
            <button class="admin-mini-button danger" type="button" data-action="delete-message">
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderDashboard() {
  renderStats();
  renderFeaturedSourceOptions();
  fillContentForm();
  renderGuestList();
  renderUpcomingList();
  renderMessageList();
}

async function loadMessages() {
  try {
    contactMessages = await store.loadContactMessages();
    renderDashboard();
  } catch (error) {
    messageList.innerHTML = `<p class="admin-list-copy">${escapeHtml(
      error.message || "Messages could not be loaded."
    )}</p>`;
  }
}

function createGuestFromForm(existingId) {
  const name = getValue("guest-name-field");
  return {
    id: existingId || store.createId("guest"),
    name,
    title: getValue("guest-title-field"),
    description: getValue("guest-description-field"),
    imageUrl: getValue("guest-image-field"),
    initials: store.getInitials(name),
    accentClass: getValue("guest-accent-field") || "accent-red",
    videoUrl: getValue("guest-video-field"),
  };
}

function createUpcomingFromForm(existingId) {
  return {
    id: existingId || store.createId("upcoming"),
    name: getValue("upcoming-name-field"),
    topic: getValue("upcoming-topic-field"),
    dateLabel: getValue("upcoming-date-label-field"),
    dateIso: getValue("upcoming-date-iso-field"),
    status: getValue("upcoming-status-field"),
  };
}

function setFeaturedFromGuest(guest) {
  content.featuredPodcast = {
    sourceGuestId: guest.id,
    guestName: guest.name,
    description: guest.description,
    imageUrl: guest.imageUrl,
    initials: guest.initials || store.getInitials(guest.name),
    accentClass: guest.accentClass || "accent-red",
    videoUrl: guest.videoUrl,
    episodeUrl: guest.videoUrl,
  };
}

function syncFeaturedGuest(previousGuest, updatedGuest) {
  const featured = content.featuredPodcast || {};
  const isFeaturedGuest =
    featured.sourceGuestId === previousGuest.id ||
    (!featured.sourceGuestId && featured.guestName === previousGuest.name);

  if (isFeaturedGuest) {
    setFeaturedFromGuest(updatedGuest);
  }
}

function bindImageUpload(fileFieldId, targetFieldId) {
  getField(fileFieldId).addEventListener("change", (event) => {
    const [file] = event.target.files;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showStatus("Please choose a valid image file.", true);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setValue(targetFieldId, reader.result);
      showStatus("Image uploaded into the form. Save changes to keep it.");
    });
    reader.readAsDataURL(file);
  });
}

logoutButton.addEventListener("click", () => {
  store.logoutAdmin();
  window.location.href = "/admin/login";
});

contentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  content.hero = {
    eyebrow: getValue("hero-eyebrow-field"),
    title: getValue("hero-title-field"),
    subtitle: getValue("hero-subtitle-field"),
  };

  const featuredName = getValue("featured-name-field");
  content.featuredPodcast = {
    guestName: featuredName,
    description: getValue("featured-description-field"),
    imageUrl: getValue("featured-image-field"),
    initials: store.getInitials(featuredName),
    accentClass: getValue("featured-accent-field") || "accent-red",
    videoUrl: getValue("featured-video-field"),
    episodeUrl: getValue("featured-episode-field"),
  };

  content.about = {
    title: getValue("about-title-field"),
    content: getValue("about-content-field"),
  };

  content.contact = {
    heading: getValue("contact-heading-field"),
    intro: getValue("contact-intro-field"),
    email: getValue("contact-email-field"),
    youtubeUrl: getValue("contact-youtube-field"),
    linkedInUrl: getValue("contact-linkedin-field"),
    whatsappUrl: getValue("contact-whatsapp-field"),
  };

  await saveContent("Website content saved successfully.");
});

getField("use-featured-source").addEventListener("click", async () => {
  const selectedGuestId = getValue("featured-source-field");
  const selectedGuest = content.podcastGuests.find((guest) => guest.id === selectedGuestId);

  if (!selectedGuest) {
    showStatus("Choose a guest first.", true);
    return;
  }

  setValue("featured-name-field", selectedGuest.name);
  setValue("featured-description-field", selectedGuest.description);
  setValue("featured-image-field", selectedGuest.imageUrl);
  setValue("featured-video-field", selectedGuest.videoUrl);
  setValue("featured-episode-field", selectedGuest.videoUrl);
  setValue("featured-accent-field", selectedGuest.accentClass || "accent-red");
  setFeaturedFromGuest(selectedGuest);
  await saveContent("Selected guest is now featured.");
});

getField("new-guest-button").addEventListener("click", () => {
  resetGuestForm();
  guestForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

getField("guest-cancel-button").addEventListener("click", resetGuestForm);

guestForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const existingId = getValue("guest-id-field");
  const guest = createGuestFromForm(existingId);

  if (existingId) {
    const previousGuest = content.podcastGuests.find((item) => item.id === existingId);
    content.podcastGuests = content.podcastGuests.map((item) =>
      item.id === existingId ? guest : item
    );
    if (previousGuest) {
      syncFeaturedGuest(previousGuest, guest);
    }
    await saveContent("Guest card updated successfully.");
  } else {
    content.podcastGuests = [guest, ...content.podcastGuests];
    await saveContent("Guest card added successfully.");
  }

  resetGuestForm();
});

guestList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  const item = event.target.closest("[data-guest-id]");

  if (!button || !item) {
    return;
  }

  const guestId = item.dataset.guestId;
  const guest = content.podcastGuests.find((entry) => entry.id === guestId);

  if (!guest) {
    return;
  }

  if (button.dataset.action === "edit-guest") {
    fillGuestForm(guest);
    return;
  }

  if (button.dataset.action === "feature-guest") {
    setFeaturedFromGuest(guest);
    await saveContent("Featured podcast updated successfully.");
    return;
  }

  if (button.dataset.action === "delete-guest") {
    const shouldDelete = window.confirm(`Delete ${guest.name} from podcast guests?`);

    if (shouldDelete) {
      content.podcastGuests = content.podcastGuests.filter((entry) => entry.id !== guestId);
      if (await saveContent("Guest card deleted successfully.")) {
        resetGuestForm();
      }
    }
  }
});

getField("new-upcoming-button").addEventListener("click", () => {
  resetUpcomingForm();
  upcomingForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

getField("upcoming-cancel-button").addEventListener("click", resetUpcomingForm);

upcomingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const existingId = getValue("upcoming-id-field");
  const guest = createUpcomingFromForm(existingId);

  if (existingId) {
    content.upcomingGuests = content.upcomingGuests.map((item) =>
      item.id === existingId ? guest : item
    );
    await saveContent("Upcoming guest updated successfully.");
  } else {
    content.upcomingGuests = [guest, ...content.upcomingGuests];
    await saveContent("Upcoming guest added successfully.");
  }

  resetUpcomingForm();
});

upcomingList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  const item = event.target.closest("[data-upcoming-id]");

  if (!button || !item) {
    return;
  }

  const upcomingId = item.dataset.upcomingId;
  const guest = content.upcomingGuests.find((entry) => entry.id === upcomingId);

  if (!guest) {
    return;
  }

  if (button.dataset.action === "edit-upcoming") {
    fillUpcomingForm(guest);
    return;
  }

  if (button.dataset.action === "delete-upcoming") {
    const shouldDelete = window.confirm(`Delete ${guest.name} from upcoming guests?`);

    if (shouldDelete) {
      content.upcomingGuests = content.upcomingGuests.filter(
        (entry) => entry.id !== upcomingId
      );
      if (await saveContent("Upcoming guest deleted successfully.")) {
        resetUpcomingForm();
      }
    }
  }
});

messageList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action='delete-message']");
  const item = event.target.closest("[data-message-id]");

  if (!button || !item) {
    return;
  }

  const message = contactMessages.find((entry) => entry.id === item.dataset.messageId);

  if (!message) {
    return;
  }

  if (!window.confirm(`Delete message from ${message.name}?`)) {
    return;
  }

  try {
    await store.deleteContactMessage(message.id);
    contactMessages = contactMessages.filter((entry) => entry.id !== message.id);
    renderDashboard();
    showStatus("Message deleted successfully.");
  } catch (error) {
    showStatus(error.message || "Message could not be deleted.", true);
  }
});

getField("refresh-messages-button").addEventListener("click", loadMessages);

bindImageUpload("featured-image-upload", "featured-image-field");
bindImageUpload("guest-image-upload", "guest-image-field");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("is-active"));
    link.classList.add("is-active");
  });
});

async function bootDashboard() {
  if (!(await store.isAdminLoggedIn())) {
    window.location.replace("/admin/login");
    return;
  }

  showStatus("Loading live website content...");
  content = await store.loadSharedContent();
  resetGuestForm();
  resetUpcomingForm();
  renderDashboard();
  await loadMessages();
  statusEl.hidden = true;
}

bootDashboard();
