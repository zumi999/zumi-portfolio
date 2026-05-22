/**
 * My Portfolio - Converted from WordPress to Static HTML + microCMS
 * Uses fetch API to dynamically load portfolio works from microCMS
 */

(function () {
  "use strict";

  // microCMS Configuration
  const MICROCMS_API_ENDPOINT =
    "https://zumi-portfolio.microcms.io/api/v1/works";
  const MICROCMS_API_KEY = "Y3Ut8NKM9kjNH5CxFnSF4U54EPhwQeEdHZyt";

  /**
   * Fetch Works from microCMS API
   */
  async function fetchWorksFromMicroCMS() {
    try {
      const response = await fetch(MICROCMS_API_ENDPOINT, {
        headers: {
          "X-MICROCMS-API-KEY": MICROCMS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.contents || [];
    } catch (error) {
      console.error("Failed to fetch works from microCMS:", error);
      return [];
    }
  }

  /**
   * Format Date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  };

  /**
   * Render Works Grid
   */
  function renderWorksGrid(works) {
    const container = document.getElementById("works-container");

    if (!works || works.length === 0) {
      container.innerHTML = '<p class="no-works">No works found</p>';
      return;
    }

    const thumbnailUrl = (work) => work.thumbnail?.url || "about:blank";

    container.innerHTML = works.slice(0, 2)
      .map(
        (work) => `
            <div class="works-card-container">
              <div class="card-shadow">
                <div class="card-border-outer">
                  <div class="card-border-inner">
                    <div class="works-content">
                      <div class="works-card" data-id="${work.id}">
                        <div class="works-card-content">
                          <h3 class="works-card-title">${work.title || "Untitled"}</h3>
                        </div>
                        <div class="works-card-image" style="background-image: url('${thumbnailUrl(work)}')">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="works-card-date">
                <h4 class="date">${work.publishedAt ? formatDate(work.publishedAt) : "Untitled"}</h4>
              </div>
            </div>
        `,
      )
      .join("");

    // Add click handlers for navigation to single works page
    document.querySelectorAll(".works-card").forEach((card) => {
      card.addEventListener("click", function () {
        const workId = this.getAttribute("data-id");
        window.location.href = `single-works.html?id=${workId}`;
      });
    });
  }

  /**
   * Show Work Detail View
   */
  function showWorkDetail(work) {
    if (!work) return;

    const detailSection = document.getElementById("work-detail");
    const detailContent = document.getElementById("work-detail-content");

    detailContent.innerHTML = `
            <div class="work-detail-header">
                <h1>${work.title || "Untitled"}</h1>
            </div>

            <div class="work-detail-meta">
                ${
                  work.role
                    ? `
                    <div class="meta-item">
                        <h4>Role</h4>
                        <p>${work.role}</p>
                    </div>
                `
                    : ""
                }
                ${
                  work.tool
                    ? `
                    <div class="meta-item">
                        <h4>Tools</h4>
                        <p>${work.tool}</p>
                    </div>
                `
                    : ""
                }
                ${
                  work.period
                    ? `
                    <div class="meta-item">
                        <h4>Period</h4>
                        <p>${work.period}</p>
                    </div>
                `
                    : ""
                }
            </div>

            ${
              work.thumbnail
                ? `
                <div class="work-detail-thumbnail">
                    <img src="${work.thumbnail.url}" alt="${work.title}">
                </div>
            `
                : ""
            }

            ${
              work.assignment
                ? `
                <section class="work-section">
                    <h2>Assignment</h2>
                    <div class="work-content">${work.assignment}</div>
                </section>
            `
                : ""
            }

            ${
              work.approach
                ? `
                <section class="work-section">
                    <h2>Approach</h2>
                    <div class="work-content">${work.approach}</div>
                </section>
            `
                : ""
            }

            ${
              work.image && work.image.length > 0
                ? `
                <section class="work-section">
                    <h2>Images</h2>
                    <div class="work-images">
                        ${work.image
                          .map(
                            (img) => `
                            <figure class="work-image-figure">
                                <img src="${img.url}" alt="${work.title}" class="work-image">
                            </figure>
                        `,
                          )
                          .join("")}
                    </div>
                </section>
            `
                : ""
            }
        `;

    detailSection.style.display = "block";
    detailSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /**
   * Initialize Route Handling for Work Detail
   */
  function initRouteHandling() {
    window.addEventListener("hashchange", handleRouteChange);
    handleRouteChange();
  }

  /**
   * Handle URL Route Changes
   */
  async function handleRouteChange() {
    const hash = window.location.hash;

    if (hash.startsWith("#work/")) {
      const workId = hash.substring(6); // Remove '#work/' prefix
      const works = await fetchWorksFromMicroCMS();
      const work = works.find((w) => w.id === workId);

      if (work) {
        showWorkDetail(work);
      }
    } else {
      // Hide work detail if navigating away
      const detailSection = document.getElementById("work-detail");
      if (detailSection) {
        detailSection.style.display = "none";
      }
    }
  }

  /**
   * Update Local Time Display
   */
  function updateLocalTime() {
    const timeElement = document.getElementById("current-time");
    if (!timeElement) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    timeElement.textContent = timeString;
  }

  /**
   * Initialize Smooth Scroll
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        // Check if it's a work detail link
        if (this.getAttribute("href").startsWith("#work/")) {
          return; // Let hash change handler deal with it
        }

        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const target = document.getElementById(targetId);

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  /**
   * Initialize Intersection Observer for Animations
   */
  function initIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements that will exist in the DOM
    document
      .querySelectorAll(".portfolio-item, .section-title, .about-content")
      .forEach((element) => {
        observer.observe(element);
      });
  }

  /**
   * Scroll Animation for Header
   */
  function initScrollAnimation() {
    const header = document.querySelector(".site-header");
    let lastScrollTop = 0;

    window.addEventListener("scroll", function () {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 100) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
  }

  /**
   * Lazy Load Images
   */
  function initLazyLoad() {
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.getAttribute("data-src")) {
              img.src = img.getAttribute("data-src");
              img.removeAttribute("data-src");
            }
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll("img[data-src]").forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }

  

  /**
   * Color Theme Switcher
   */
  function initColorTheme() {
    const root = document.documentElement;
    const btn = document.getElementById("btn-toggle");

    const colors = ["#000", "#2904E2", "#00BA0F"];
    let colorIndex = 0;

    btn.addEventListener("click", () => {
      colorIndex = (colorIndex + 1) % colors.length;
      root.style.setProperty("--color-primary", colors[colorIndex]);
    });
  }

  /**
   * Document Ready Handler
   */
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  

  /**
   * Initialize All Functions
   */
  ready(async function () {
    // Update time immediately and then every second
    updateLocalTime();
    setInterval(updateLocalTime, 1000);

    // Load works from microCMS and render
    const works = await fetchWorksFromMicroCMS();
    renderWorksGrid(works);

    // Initialize features
    initSmoothScroll();
    initIntersectionObserver();
    initScrollAnimation();
    initLazyLoad();
    initCompass();
    initColorTheme();
    initLanguageToggle();
    initRouteHandling();

    // Keyboard Navigation Enhancement
    document.addEventListener("keydown", function (event) {
      // ESC key to close detail view
      if (event.key === "Escape") {
        const detailSection = document.getElementById("work-detail");
        if (detailSection && detailSection.style.display !== "none") {
          detailSection.style.display = "none";
          window.location.hash = "#works";
        }
      }
    });

    // Custom event
    document.dispatchEvent(new CustomEvent("portfolio-ready"));
  });

  /**
   * Expose some functions to global scope for external use
   */
  window.PortfolioApp = {
    updateLocalTime: updateLocalTime,
    fetchWorksFromMicroCMS: fetchWorksFromMicroCMS,
    renderWorksGrid: renderWorksGrid,
    showWorkDetail: showWorkDetail,
  };
})();


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
