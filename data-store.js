(function () {
  const STORAGE_KEY = "milesStudio.content.v1";
  const AUTH_KEY = "milesStudio.adminSession.v2";
  const ADMIN_TOKEN_KEY = "milesStudio.adminToken.v1";
  const PENDING_CONTENT_KEY = "milesStudio.pendingContentSave.v1";
  let lastAdminLoginError = "";

  const placeholderVideoUrl = "https://www.youtube.com/watch?v=ysz5S6PUM-U";

  const defaultContent = {
    brandName: "Miles Studio",
    logoPath: "Assets/Miles Studio logo.png",
    podcastLogoPath: "Assets/miles studio open book podcast logo.png",
    hero: {
      eyebrow: "YouTube Podcast Channel",
      title: "Conversations That Inspire Growth",
      subtitle:
        "Welcome to Miles Studio - a podcast platform where we talk with inspiring people, creators, professionals, and learners to share real experiences and life lessons.",
    },
    featuredPodcast: {
      guestName: "Riya Mehta",
      description:
        "A thoughtful conversation about career growth, creative confidence, and the lessons that help people keep moving forward.",
      imageUrl: "",
      initials: "RM",
      accentClass: "accent-red",
      videoUrl: placeholderVideoUrl,
      episodeUrl: placeholderVideoUrl,
    },
    // Update guest names, titles, descriptions, images, and video links here.
    podcastGuests: [
      {
        id: "guest-aarav-sharma",
        name: "Aarav Sharma",
        title: "Career Coach",
        description:
          "A practical conversation about career decisions, confidence, and building a steady path as a learner.",
        imageUrl: "",
        initials: "AS",
        accentClass: "accent-red",
        videoUrl: placeholderVideoUrl,
      },
      {
        id: "guest-nisha-verma",
        name: "Nisha Verma",
        title: "Content Creator",
        description:
          "Stories from the creator journey, including consistency, audience building, and lessons from early mistakes.",
        imageUrl: "",
        initials: "NV",
        accentClass: "accent-teal",
        videoUrl: placeholderVideoUrl,
      },
      {
        id: "guest-kabir-khan",
        name: "Kabir Khan",
        title: "Startup Founder",
        description:
          "A founder's perspective on discipline, business learning, and solving real customer problems.",
        imageUrl: "",
        initials: "KK",
        accentClass: "accent-gold",
        videoUrl: placeholderVideoUrl,
      },
      {
        id: "guest-meera-iyer",
        name: "Meera Iyer",
        title: "Educator",
        description:
          "An honest talk on learning methods, student motivation, and building curiosity for lifelong growth.",
        imageUrl: "",
        initials: "MI",
        accentClass: "accent-ink",
        videoUrl: placeholderVideoUrl,
      },
      {
        id: "guest-rohan-patel",
        name: "Rohan Patel",
        title: "Digital Marketer",
        description:
          "Insights on personal branding, online communication, and using digital platforms with clarity.",
        imageUrl: "",
        initials: "RP",
        accentClass: "accent-teal",
        videoUrl: placeholderVideoUrl,
      },
      {
        id: "guest-ananya-rao",
        name: "Ananya Rao",
        title: "Creative Professional",
        description:
          "A warm conversation about creativity, self-expression, and turning everyday experiences into meaningful work.",
        imageUrl: "",
        initials: "AR",
        accentClass: "accent-red",
        videoUrl: placeholderVideoUrl,
      },
    ],
    // Update upcoming guest names, topics, dates, and status here.
    upcomingGuests: [
      {
        id: "upcoming-vikram-singh",
        name: "Vikram Singh",
        topic: "Entrepreneurship and first business lessons",
        dateLabel: "June 2026",
        dateIso: "2026-06",
        status: "Coming Soon",
      },
      {
        id: "upcoming-sara-thomas",
        name: "Sara Thomas",
        topic: "Creativity, learning, and personal discipline",
        dateLabel: "July 2026",
        dateIso: "2026-07",
        status: "Coming Soon",
      },
      {
        id: "upcoming-dev-malhotra",
        name: "Dev Malhotra",
        topic: "Technology careers and skill building",
        dateLabel: "August 2026",
        dateIso: "2026-08",
        status: "Coming Soon",
      },
      {
        id: "upcoming-priya-nair",
        name: "Priya Nair",
        topic: "Personal growth through real life experiences",
        dateLabel: "September 2026",
        dateIso: "2026-09",
        status: "Coming Soon",
      },
    ],
    about: {
      title: "About Miles Studio",
      content:
        "Miles Studio is a podcast channel focused on real conversations, life learning, career growth, creativity, business, and personal experiences. The goal is to bring valuable stories and lessons from different people to the audience.",
    },
    contact: {
      heading: "Connect for Podcast Collaboration",
      intro:
        "Have a story, guest suggestion, or collaboration idea for Miles Studio? Send a message and I will connect with you soon.",
      email: "tanveerhk.it@gmail.com",
      youtubeUrl: "https://www.youtube.com/@milesstudio",
      linkedInUrl: "https://www.linkedin.com/in/tanveerhkit",
      whatsappUrl:
        "https://wa.me/919653030160?text=Hi%2C%20I%20want%20to%20connect%20with%20you%20for%20the%20podcast.",
    },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeContent(savedContent) {
    const content = clone(defaultContent);
    const saved = savedContent && typeof savedContent === "object" ? savedContent : {};
    const featuredGuestId = saved.featuredGuestId || saved.featuredPodcast?.sourceGuestId || "";

    return {
      ...content,
      ...saved,
      featuredGuestId,
      hero: { ...content.hero, ...(saved.hero || {}) },
      featuredPodcast: {
        ...content.featuredPodcast,
        ...(saved.featuredPodcast || {}),
      },
      podcastGuests: (
        Array.isArray(saved.podcastGuests) ? saved.podcastGuests : content.podcastGuests
      ).map((guest) => ({
        ...guest,
        isFeatured: featuredGuestId
          ? guest.id === featuredGuestId
          : Boolean(guest.isFeatured),
      })),
      upcomingGuests: Array.isArray(saved.upcomingGuests)
        ? saved.upcomingGuests
        : content.upcomingGuests,
      about: { ...content.about, ...(saved.about || {}) },
      contact: { ...content.contact, ...(saved.contact || {}) },
    };
  }

  function getSiteContent() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return mergeContent(saved ? JSON.parse(saved) : null);
    } catch (error) {
      console.warn("Miles Studio content could not be loaded.", error);
      return clone(defaultContent);
    }
  }

  function saveSiteContent(content) {
    const normalized = mergeContent(content);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function getFeaturedGuestId(content) {
    return content?.featuredGuestId || content?.featuredPodcast?.sourceGuestId || "";
  }

  function resetSiteContent() {
    localStorage.removeItem(STORAGE_KEY);
    return getSiteContent();
  }

  async function requestJson(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      throw new Error(data?.message || "Request failed. Please try again.");
    }

    return data;
  }

  async function loadSharedContent() {
    if (localStorage.getItem(PENDING_CONTENT_KEY)) {
      return getSiteContent();
    }

    try {
      const data = await requestJson("/api/content", {
        method: "GET",
        cache: "no-store",
      });
      return saveSiteContent(data?.content || defaultContent);
    } catch (error) {
      console.warn("Live content could not be loaded. Using local content.", error);
      return getSiteContent();
    }
  }

  async function saveSharedContent(content) {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const normalized = mergeContent({
      ...content,
      updatedAt: new Date().toISOString(),
    });
    saveSiteContent(normalized);
    localStorage.setItem(PENDING_CONTENT_KEY, "true");

    if (!token) {
      throw new Error("Admin session expired. Please login again.");
    }

    const data = await requestJson("/api/content", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: normalized }),
    });

    const liveData = await requestJson(`/api/content?ts=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
    });
    const liveContent = mergeContent(liveData?.content || {});

    if (getFeaturedGuestId(liveContent) !== getFeaturedGuestId(normalized)) {
      throw new Error(
        "Live publish did not keep the selected featured guest. Please check Supabase/Vercel settings."
      );
    }

    localStorage.removeItem(PENDING_CONTENT_KEY);
    return saveSiteContent(data?.content || normalized);
  }

  async function loadContactMessages() {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);

    if (!token) {
      throw new Error("Admin session expired. Please login again.");
    }

    const data = await requestJson("/api/contact", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return Array.isArray(data?.messages) ? data.messages : [];
  }

  async function deleteContactMessage(messageId) {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);

    if (!token) {
      throw new Error("Admin session expired. Please login again.");
    }

    return requestJson(`/api/contact?id=${encodeURIComponent(messageId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function loginAdmin(email, password) {
    lastAdminLoginError = "";

    try {
      const data = await requestJson("/api/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!data?.token) {
        return false;
      }

      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      sessionStorage.setItem(
        AUTH_KEY,
        JSON.stringify({
          email,
          loggedIn: true,
          loginTime: new Date().toISOString(),
        })
      );

      return true;
    } catch (error) {
      console.warn("Admin login failed.", error);
      lastAdminLoginError = error.message || "Admin login failed.";
      return false;
    }
  }

  function getLastAdminLoginError() {
    return lastAdminLoginError;
  }

  async function isAdminLoggedIn() {
    return Boolean(sessionStorage.getItem(ADMIN_TOKEN_KEY));
  }

  function logoutAdmin() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  function createId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function getInitials(name) {
    return String(name || "MS")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  function getYouTubeVideoId(url) {
    const value = String(url || "").trim();

    if (!value) {
      return "";
    }

    const patterns = [
      /youtu\.be\/([A-Za-z0-9_-]{6,})/,
      /youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,
      /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
      /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
    ];

    for (const pattern of patterns) {
      const match = value.match(pattern);
      if (match) {
        return match[1];
      }
    }

    try {
      const parsedUrl = new URL(value);
      return parsedUrl.searchParams.get("v") || "";
    } catch (error) {
      return "";
    }
  }

  function getYouTubeEmbedUrl(url) {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  function getYouTubeThumbnailUrl(url) {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  }

  function getYouTubeWatchUrl(url) {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : String(url || "#");
  }

  window.MilesStudioStore = {
    defaultContent: clone(defaultContent),
    getSiteContent,
    saveSiteContent,
    loadSharedContent,
    saveSharedContent,
    loadContactMessages,
    deleteContactMessage,
    resetSiteContent,
    loginAdmin,
    getLastAdminLoginError,
    logoutAdmin,
    isAdminLoggedIn,
    createId,
    getInitials,
    getYouTubeEmbedUrl,
    getYouTubeThumbnailUrl,
    getYouTubeWatchUrl,
  };
})();
