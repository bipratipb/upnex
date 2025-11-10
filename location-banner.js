/* =========================================================================
   LOCATION-AWARE BANNER MODULE (Final)
   ========================================================================= */

(function (global) {
  let config = {
    size: "md",
    color: "#000",
    linkColor: "#000",
    bg: "#fff",
    fontFamily: "Inter, sans-serif",
    nearYouThreshold: 100,
  };

  let banner = null;

  global.initLocationBanner = function (userConfig = {}) {
    config = { ...config, ...userConfig };
    banner =
      document.getElementById("location-banner-container") || createBanner();
    applyStyleVars();
    init();
  };

  function createBanner() {
    const div = document.createElement("div");
    div.id = "location-banner-container";
    div.className = "location-banner-container";
    document.body.prepend(div);
    return div;
  }

  function applyStyleVars() {
    banner.style.setProperty("--banner-text-color", config.color);
    banner.style.setProperty("--banner-link-color", config.linkColor);
    banner.style.setProperty("--banner-bg", config.bg);
    banner.style.setProperty("--banner-font", config.fontFamily);
    const map = { sm: "15px", md: "16px", lg: "18px" };
    banner.style.setProperty("--banner-font-size", map[config.size] || map.md);
  }

  function init() {
    setBanner(
      `<a href=".optin">Be the first</a> to know when a show is coming to your city & other announcements!`
    );

    if (!navigator.geolocation) return noNearby();

    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) noNearby();
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      () => {
        resolved = true;
        clearTimeout(timer);
        waitForEventData();
      },
      () => {
        resolved = true;
        clearTimeout(timer);
        noNearby();
      }
    );

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then((st) => {
        st.onchange = () => window.location.reload();
      });
    }

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a && a.getAttribute("href")?.startsWith(".")) {
        e.preventDefault();
        const tgt = document.querySelector(a.getAttribute("href"));
        if (tgt) tgt.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  function waitForEventData() {
    if (window.latestEventsData) return update(window.latestEventsData);
    document.addEventListener(
      "eventsDataReady",
      (e) => {
        window.latestEventsData = e.detail;
        update(e.detail);
      },
      { once: true }
    );
  }

  function update({ events }) {
    if (!Array.isArray(events) || !events.length) return noNearby();
    const nearby = events.filter(
      (e) =>
        typeof e.distance === "number" &&
        isFinite(e.distance) &&
        e.distance <= config.nearYouThreshold
    );
    if (nearby.length > 0) {
      const c = nearby[0].displayCity || "";
      const s = nearby[0].displayState || "";
      const loc = s ? `${c}, ${s}` : c;
      setBanner(`UPCOMING SHOW ${loc} <a href=".tour">GET TICKETS</a>`);
    } else noNearby();
  }

  function noNearby() {
    setBanner(
      `No shows nearby. <a href=".optin">Request</a> a show & be the first to know!`
    );
  }

  function setBanner(html) {
    banner.innerHTML = html;
  }
})(window);
