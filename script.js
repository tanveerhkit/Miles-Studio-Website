const store = window.MilesStudioStore;
let siteContent = store.getSiteContent();

const siteHeader = document.querySelector("#site-header");
const heroSection = document.querySelector(".hero");
const guestGrid = document.querySelector("#guest-grid");
const upcomingSection = document.querySelector("#upcoming");
const upcomingGrid = document.querySelector("#upcoming-grid");
const featuredCard = document.querySelector("#featured-card");
const navToggle = document.querySelector(".nav-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const mobileMenuClose = document.querySelector(".mobile-menu-close");
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
      const labelTarget = link.querySelector("[data-link-label]");
      if (labelTarget) {
        labelTarget.textContent = label;
      }
    }
  });
}

function padCount(value) {
  return String(value).padStart(2, "0");
}

/* ── Scroll reveal ── */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const revealObserver =
  "IntersectionObserver" in window && !prefersReducedMotion
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      )
    : null;

function observeReveals(root = document) {
  root.querySelectorAll("[data-reveal]:not(.revealed)").forEach((el) => {
    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      el.classList.add("revealed");
    }
  });
}

/* ── Section number counters ── */

function runCounter(el) {
  const target = parseInt(el.dataset.count, 10) || 0;
  const digits = el.dataset.count.length;
  let current = 0;

  el.textContent = String(current).padStart(digits, "0");
  const timer = setInterval(() => {
    current += 1;
    el.textContent = String(current).padStart(digits, "0");
    if (current >= target) {
      clearInterval(timer);
    }
  }, 120);
}

const counterObserver =
  "IntersectionObserver" in window && !prefersReducedMotion
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      )
    : null;

if (counterObserver) {
  document.querySelectorAll(".section-num[data-count]").forEach((el) => {
    counterObserver.observe(el);
  });
}

/* ── Rendering ── */

function renderHeroTitle(title) {
  const heroTitle = document.querySelector("#hero-title");
  if (!heroTitle) {
    return;
  }

  const words = String(title || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return;
  }

  let lines;
  if (words.length >= 3) {
    lines = [words[0], words.slice(1, -1).join(" "), words[words.length - 1]];
  } else {
    lines = words;
  }

  const lastIndex = lines.length - 1;
  if (!/[.!?]$/.test(lines[lastIndex])) {
    lines[lastIndex] += ".";
  }

  heroTitle.innerHTML = lines
    .map((line, index) => {
      const isLast = index === lastIndex;
      return `
        <div class="line-wrap">
          <span class="line-inner${isLast ? " line-red red-line" : ""}">${escapeHtml(line)}</span>
        </div>
      `;
    })
    .join("");
}

function renderVideoFrame(featuredPodcast) {
  const watchUrl = store.getYouTubeWatchUrl(featuredPodcast.videoUrl);
  const thumbnailUrl = store.getYouTubeThumbnailUrl(featuredPodcast.videoUrl);
  const videoId = store.getYouTubeEmbedUrl(featuredPodcast.videoUrl)
    .split("/")
    .pop();

  if (!thumbnailUrl || watchUrl === "#") {
    return `
      <div class="video-placeholder">
        <p>New episode coming soon.</p>
      </div>
    `;
  }

  return `
    <button
      class="yt-facade"
      type="button"
      data-videoid="${escapeAttribute(videoId)}"
      aria-label="Play ${escapeAttribute(featuredPodcast.guestName)} podcast episode"
    >
      <img
        src="${escapeAttribute(thumbnailUrl)}"
        alt="${escapeAttribute(featuredPodcast.guestName)} podcast episode thumbnail"
        loading="lazy"
        width="480"
        height="360"
      />
      <span class="yt-play-btn" aria-hidden="true"></span>
    </button>
  `;
}

function getFeaturedPodcast() {
  const featured = siteContent.featuredPodcast || {};
  const featuredGuestId = siteContent.featuredGuestId || featured.sourceGuestId || "";
  const guest = siteContent.podcastGuests.find(
    (item) =>
      item.id === featuredGuestId ||
      item.isFeatured ||
      (!featuredGuestId && item.name === featured.guestName)
  );

  if (!guest) {
    return featured;
  }

  return {
    ...featured,
    sourceGuestId: guest.id,
    guestName: guest.name,
    guestTitle: guest.title,
    description: guest.description,
    imageUrl: guest.imageUrl,
    initials: guest.initials || store.getInitials(guest.name),
    videoUrl: guest.videoUrl || featured.videoUrl,
    episodeUrl: guest.videoUrl || featured.episodeUrl || featured.videoUrl,
  };
}

function renderFeaturedPodcast() {
  if (!featuredCard) {
    return;
  }

  const featuredPodcast = getFeaturedPodcast();
  const watchUrl = store.getYouTubeWatchUrl(
    featuredPodcast.episodeUrl || featuredPodcast.videoUrl
  );
  const tags = [featuredPodcast.guestTitle].filter(Boolean);

  featuredCard.innerHTML = `
    <div class="video-wrap">
      ${renderVideoFrame(featuredPodcast)}
    </div>
    <div class="featured-info">
      <span class="featured-ep-num" aria-hidden="true">01</span>
      <p class="eyebrow bracket-frame">Latest Episode</p>
      <h3>${escapeHtml(featuredPodcast.guestName)}</h3>
      <p class="featured-desc">${escapeHtml(featuredPodcast.description)}</p>
      ${
        tags.length
          ? `<div class="featured-tags">${tags
              .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
              .join("")}</div>`
          : ""
      }
      <a
        class="featured-watch-link"
        href="${escapeAttribute(watchUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Watch Full Episode &rarr;
      </a>
    </div>
  `;
}

function renderGuestAvatar(guest) {
  const name = guest.name || "Miles Studio";
  const initials = guest.initials || store.getInitials(name);

  if (guest.imageUrl) {
    return `
      <div class="guest-avatar">
        <img
          src="${escapeAttribute(guest.imageUrl)}"
          alt="${escapeAttribute(name)} podcast guest"
          loading="lazy"
          width="56"
          height="56"
        />
      </div>
    `;
  }

  return `
    <div class="guest-avatar is-initials" aria-hidden="true">
      ${escapeHtml(initials)}
    </div>
  `;
}

function updateEpisodeCounts(count) {
  const padded = padCount(count);
  setText("#stat-episodes", `${padded}+`);
  setText("#about-episodes", `${padded}+`);
  setText("#guest-count-pill", `${padded} Episodes`);
}

function renderPodcastGuests() {
  if (!guestGrid) {
    return;
  }

  const guests = Array.isArray(siteContent.podcastGuests)
    ? siteContent.podcastGuests
    : [];

  updateEpisodeCounts(guests.length);

  if (!guests.length) {
    guestGrid.innerHTML = `
      <div class="guests-empty">
        <img src="Assets/ms-monogram.png" alt="" loading="lazy" width="90" height="122" />
        <strong>First episode dropping soon</strong>
        <p>Subscribe to be the first to know.</p>
        <a
          class="btn-primary"
          data-youtube-link
          href="${escapeAttribute(siteContent.contact?.youtubeUrl || "https://www.youtube.com/@milesstudio")}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Subscribe</span>
        </a>
      </div>
    `;
    return;
  }

  guestGrid.innerHTML = guests
    .map((guest, index) => {
      const videoUrl = store.getYouTubeWatchUrl(guest.videoUrl);
      const delay = index % 3;

      return `
        <a
          class="guest-card"
          data-reveal${delay ? ` data-delay="${delay}"` : ""}
          href="${escapeAttribute(videoUrl)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="guest-ep-num" aria-hidden="true">${padCount(index + 1)}</span>
          ${renderGuestAvatar(guest)}
          <h3 class="guest-name">${escapeHtml(guest.name)}</h3>
          <p class="guest-topic">${escapeHtml(guest.title)}${
            guest.description ? ` &mdash; ${escapeHtml(guest.description)}` : ""
          }</p>
          <span class="guest-watch">Watch <span class="arrow">&rarr;</span></span>
        </a>
      `;
    })
    .join("");

  observeReveals(guestGrid);
}

function renderUpcomingGuests() {
  if (!upcomingSection || !upcomingGrid) {
    return;
  }

  const upcoming = Array.isArray(siteContent.upcomingGuests)
    ? siteContent.upcomingGuests
    : [];

  if (!upcoming.length) {
    upcomingSection.hidden = true;
    return;
  }

  upcomingSection.hidden = false;
  upcomingGrid.innerHTML = upcoming
    .map(
      (guest, index) => `
        <article class="upcoming-item" data-reveal>
          <div class="upcoming-left">
            <span class="upcoming-num" aria-hidden="true">${padCount(index + 1)}</span>
            <div>
              <h3>${escapeHtml(guest.name)}</h3>
              <p>${escapeHtml(guest.topic)}${
                guest.dateLabel ? ` &middot; ${escapeHtml(guest.dateLabel)}` : ""
              }</p>
            </div>
          </div>
          <span class="upcoming-badge">${escapeHtml(guest.status || "Coming Soon")}</span>
        </article>
      `
    )
    .join("");

  observeReveals(upcomingGrid);
}

function renderEditableContent() {
  const { hero, about, contact } = siteContent;

  setText("#hero-eyebrow", hero.eyebrow);
  renderHeroTitle(hero.title);
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
  observeReveals();
}

/* ── Hero load animation ── */

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (heroSection) {
      heroSection.classList.add("hero-loaded");
    }
  }, 100);
});

/* ── Header scroll state ── */

function updateHeaderState() {
  if (siteHeader) {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 80);
  }
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

/* ── Active nav link ── */

const navSections = ["home", "episodes", "guests", "about", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function updateActiveNavLink() {
  const scrollPosition = window.scrollY + window.innerHeight * 0.35;
  let activeId = navSections[0] ? navSections[0].id : "";

  navSections.forEach((section) => {
    if (section.offsetTop <= scrollPosition) {
      activeId = section.id;
    }
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
  });
}

window.addEventListener("scroll", updateActiveNavLink, { passive: true });
updateActiveNavLink();

/* ── Mobile menu ── */

function closeMobileMenu() {
  if (!mobileMenu || !navToggle) {
    return;
  }

  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("nav-open");
}

function openMobileMenu() {
  if (!mobileMenu || !navToggle) {
    return;
  }

  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Close navigation");
  document.body.classList.add("nav-open");
}

if (navToggle && mobileMenu) {
  navToggle.addEventListener("click", () => {
    if (mobileMenu.classList.contains("is-open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

if (mobileMenuClose) {
  mobileMenuClose.addEventListener("click", closeMobileMenu);
}

document.querySelectorAll(".mobile-menu .nav-link").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

/* ── YouTube facade → real iframe on click ── */

if (featuredCard) {
  featuredCard.addEventListener("click", (event) => {
    const facade = event.target.closest(".yt-facade");
    if (!facade) {
      return;
    }

    const videoId = facade.dataset.videoid;
    if (!videoId) {
      return;
    }

    facade.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${escapeAttribute(videoId)}?autoplay=1"
        title="Miles Studio featured episode"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    `;
  });
}

/* ── Contact form (existing /api/contact handler) ── */

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector("button[type='submit']");
    const submitLabel = submitButton.querySelector("span");
    const payload = {
      name: contactForm.elements.name.value.trim(),
      email: contactForm.elements.email.value.trim(),
      message: contactForm.elements.message.value.trim(),
    };

    submitButton.disabled = true;
    submitLabel.textContent = "Sending...";
    formStatus.hidden = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Message could not be sent.");
      }

      formStatus.textContent =
        data?.message || "Thank you for reaching out! I will connect with you soon.";
      formStatus.hidden = false;
      contactForm.reset();
    } catch (error) {
      formStatus.textContent =
        error.message || "Message could not be sent. Please use WhatsApp or email.";
      formStatus.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitLabel.textContent = "Send Message";
    }
  });
}

/* ── Content loading ── */

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
