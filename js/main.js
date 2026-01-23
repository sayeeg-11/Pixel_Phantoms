<<<<<<< HEAD


document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderNavbar === 'function') renderNavbar(window.basePath || '');
    if (typeof renderFooter === 'function') renderFooter(window.basePath || '');
=======
/* ============================
   MAIN.JS - GLOBAL SCRIPTS
   ============================ */
>>>>>>> 7e757b0 (Add global loader for page navigation)

document.addEventListener("DOMContentLoaded", () => {
  /* ============================
     GLOBAL LOADER
     ============================ */
  const loader = document.getElementById("global-loader");

  const showLoader = () => {
    if (loader) loader.classList.remove("hidden");
  };

  const hideLoader = () => {
    if (loader) loader.classList.add("hidden");
  };

  // Hide loader after page fully loads
  window.addEventListener("load", hideLoader);

  // ✅ Event delegation (works even if navbar links are added later)
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    // Ignore hash links, external links, mailto/tel
    if (
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    // Show loader for internal navigation
    showLoader();
  });

  /* ============================
     OPTIONAL: DEBUG (remove later)
     ============================ */
  // console.log("main.js loaded ✅");
});

