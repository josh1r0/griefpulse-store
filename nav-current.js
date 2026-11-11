/* SHADOWLAND navigation — current page/section indicator (presentation only). */
(() => {
  "use strict";
  function start() {
    const nav = document.querySelector(".header .nav nav.showcase-nav");
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll("a[href]"));
    const shopIds = new Set(["donate-tab", "coins-tab", "cases-tab"]);
    const pageName = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

    function destination(anchor) {
      const url = new URL(anchor.getAttribute("href"), window.location.href);
      const page = (url.pathname.split("/").pop() || "index.html").toLowerCase();
      if (page === "rules.html") return "rules";
      if (page === "complaints.html") return "complaints";
      if (page !== "index.html") return "";
      const hash = decodeURIComponent(url.hash.slice(1));
      if (hash === "why") return "why";
      if (shopIds.has(hash)) return hash;
      return "top";
    }

    function selectedShopTab() {
      for (const button of document.querySelectorAll(".shop-tabs .shop-tab")) {
        if (!button.classList.contains("active")) continue;
        const match = button.getAttribute("onclick")?.match(/showShopTab\(['"]([^'"]+)/);
        if (match && shopIds.has(match[1])) return match[1];
      }
      const hash = window.location.hash.slice(1);
      return shopIds.has(hash) ? hash : "donate-tab";
    }

    function currentSection() {
      if (pageName === "rules.html") return "rules";
      if (pageName === "complaints.html" || pageName === "moderation.html") return "complaints";
      const about = document.getElementById("why");
      if (about && about.getBoundingClientRect().top <= window.innerHeight * 0.48) return "why";
      const categoryBar = document.getElementById("showcase-categories");
      if (categoryBar && categoryBar.getBoundingClientRect().top <= window.innerHeight * 0.48)
        return selectedShopTab();
      return "top";
    }

    function mark(section) {
      for (const anchor of links) {
        const active = destination(anchor) === section;
        anchor.classList.toggle("is-current", active);
        if (active) anchor.setAttribute("aria-current", "page");
        else anchor.removeAttribute("aria-current");
      }
    }

    let framePending = false;
    function sync() {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(() => {
        framePending = false;
        mark(currentSection());
      });
    }
    mark(currentSection());
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest?.(".header .nav nav.showcase-nav a");
      if (anchor) {
        const section = destination(anchor);
        if (section) mark(section);
      }
      const button = event.target.closest?.(".shop-tabs .shop-tab");
      if (button) {
        const matched = button.getAttribute("onclick")?.match(/showShopTab\(['"]([^'"]+)/);
        if (matched && shopIds.has(matched[1])) mark(matched[1]);
      }
    });
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    window.addEventListener("hashchange", () => {
      const section = window.location.hash.slice(1);
      if (section === "why" || shopIds.has(section) || section === "top") mark(section);
      requestAnimationFrame(sync);
    });
    window.addEventListener("pageshow", sync);
    requestAnimationFrame(sync);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
