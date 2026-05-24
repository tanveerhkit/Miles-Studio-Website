const store = window.MilesStudioStore;
let siteContent = store.getSiteContent();

const guestGrid = document.querySelector("#guest-grid");
const upcomingGrid = document.querySelector("#upcoming-grid");
const featuredCard = document.querySelector("#featured-card");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#primary-menu");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

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

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function setLink(selector, href, label) {
  document.querySelectorAll(selector).forEach((link) => {
    link.href = href;
    if (label) {
      link.textContent = label;
    }
  });
}

function renderAvatar(item, className) {
  const name = item.name || item.guestName || "Miles Studio";
  const initials = item.initials || store.getInitials(name);
  const accentClass = item.accentClass || "accent-red";

  if (item.imageUrl) {
    return `
      <div class="${className} has-image">
        <img src="${escapeAttribute(item.imageUrl)}" alt="${escapeAttribute(name)} podcast guest" />
      </div>
    `;
  }

  return `
    <div class="${className} ${escapeAttribute(accentClass)}" aria-hidden="true">
      ${escapeHtml(initials)}
    </div>
  `;
}

function renderVideoFrame(featuredPodcast) {
  const watchUrl = store.getYouTubeWatchUrl(featuredPodcast.videoUrl);
  const thumbnailUrl = store.getYouTubeThumbnailUrl(featuredPodcast.videoUrl);

  if (!thumbnailUrl || watchUrl === "#") {
    return `
      <div class="video-frame">
        <div class="video-placeholder">
          <p>Add a valid YouTube video link from the admin dashboard.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="video-frame">
      <a
        class="video-preview"
        href="${escapeAttribute(watchUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Watch ${escapeAttribute(featuredPodcast.guestName)} podcast episode on YouTube"
      >
        <img
          src="${escapeAttribute(thumbnailUrl)}"
          alt="${escapeAttribute(featuredPodcast.guestName)} podcast episode thumbnail"
          loading="lazy"
        />
        <span class="video-preview-overlay" aria-hidden="true">
          <span class="video-play-button"></span>
          <strong>Watch on YouTube</strong>
        </span>
      </a>
    </div>
  `;
}

function renderFeaturedPodcast() {
  const featuredPodcast = siteContent.featuredPodcast;
  const watchUrl = store.getYouTubeWatchUrl(
    featuredPodcast.episodeUrl || featuredPodcast.videoUrl
  );

  featuredCard.innerHTML = `
    ${renderVideoFrame(featuredPodcast)}
    <div class="featured-content">
      <div class="featured-profile">
        ${renderAvatar(featuredPodcast, "featured-avatar")}
        <div>
          <p class="card-kicker">Featured Guest</p>
          <h3>${escapeHtml(featuredPodcast.guestName)}</h3>
        </div>
      </div>
      <p>${escapeHtml(featuredPodcast.description)}</p>
      <a
        class="btn btn-primary"
        href="${escapeAttribute(watchUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Watch Episode
      </a>
    </div>
  `;
}

function renderPodcastGuests() {
  guestGrid.innerHTML = siteContent.podcastGuests
    .map((guest) => {
      const videoUrl = store.getYouTubeWatchUrl(guest.videoUrl);

      return `
        <article class="guest-card">
          ${renderAvatar(guest, "guest-photo")}
          <div class="guest-card-body">
            <h3>${escapeHtml(guest.name)}</h3>
            <p class="guest-title">${escapeHtml(guest.title)}</p>
            <p class="guest-description">${escapeHtml(guest.description)}</p>
            <a
              class="episode-link"
              href="${escapeAttribute(videoUrl)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube episode link
            </a>
            <a
              class="btn btn-card"
              href="${escapeAttribute(videoUrl)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch Podcast
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderUpcomingGuests() {
  upcomingGrid.innerHTML = siteContent.upcomingGuests
    .map(
      (guest) => `
        <article class="upcoming-card">
          <span class="status-badge">${escapeHtml(guest.status)}</span>
          <h3>${escapeHtml(guest.name)}</h3>
          <p class="upcoming-topic">${escapeHtml(guest.topic)}</p>
          <time class="upcoming-date" datetime="${escapeAttribute(guest.dateIso)}">
            ${escapeHtml(guest.dateLabel)}
          </time>
        </article>
      `
    )
    .join("");
}

function renderEditableContent() {
  const { hero, about, contact } = siteContent;

  setText("#hero-eyebrow", hero.eyebrow);
  setText("#hero-title", hero.title);
  setText("#hero-subtitle", hero.subtitle);
  setText("#about-title", about.title);
  setText("#about-copy", about.content);
  setText("#contact-title", contact.heading);
  setText("#contact-intro", contact.intro);

  setLink("[data-youtube-link]", contact.youtubeUrl);
  setLink("[data-linkedin-link]", contact.linkedInUrl);
  setLink("[data-email-link]", `mailto:${contact.email}`, contact.email);
  setLink("[data-whatsapp-link]", contact.whatsappUrl);

  renderFeaturedPodcast();
  renderPodcastGuests();
  renderUpcomingGuests();
}

function closeMobileMenu() {
  if (!navMenu || !navToggle) {
    return;
  }

  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("nav-open");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    document.body.classList.toggle("nav-open", isOpen);
  });
}

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = "Thank you for reaching out! I will connect with you soon.";
    alert(message);
    formStatus.textContent = message;
    formStatus.hidden = false;
    contactForm.reset();
  });
}

window.addEventListener("storage", () => {
  siteContent = store.getSiteContent();
  renderEditableContent();
  window.MilesStudioData = siteContent;
});

async function loadLiveContent() {
  siteContent = await store.loadSharedContent();
  renderEditableContent();
  window.MilesStudioData = siteContent;
}

renderEditableContent();
loadLiveContent();

window.MilesStudioData = siteContent;
