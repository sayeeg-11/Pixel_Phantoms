(function (window, document) {
  'use strict';

  const PageTransitions = (function () {
    const DEFAULTS = {
      duration: 350,
      type: 'fade-slide',
      scrollToTop: true,
      showLoadingIndicator: true,
      loadingThreshold: 300,
    };

    const isInternalLink = link => {
      try {
        const url = new URL(link.href, location.href);
        return url.origin === location.origin && !link.hasAttribute('download');
      } catch (e) {
        return false;
      }
    };

    const isAnchorLink = link => link.hash && link.pathname === location.pathname;

    let config = { ...DEFAULTS };
    let isTransitioning = false;
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let loadingTimer = null;
    let loadingOverlay = null;
    const cache = new Map();

    function findWrapper(doc) {
      return doc.querySelector('.page-transition-wrapper');
    }

    function runTransitionOut(oldWrapper) {
      return new Promise(resolve => {
        if (!oldWrapper || prefersReducedMotion) return resolve();
        oldWrapper.classList.add('page-exit');
        oldWrapper.getBoundingClientRect(); // trigger reflow
        oldWrapper.classList.add('page-exit-active');
        setTimeout(resolve, config.duration);
      });
    }

    function runTransitionIn(newWrapper) {
      return new Promise(resolve => {
        if (!newWrapper || prefersReducedMotion) return resolve();
        newWrapper.classList.add('page-enter');
        newWrapper.getBoundingClientRect(); // trigger reflow
        newWrapper.classList.add('page-enter-active');
        setTimeout(() => {
          newWrapper.classList.remove('page-enter', 'page-enter-active');
          resolve();
        }, config.duration);
      });
    }

    async function fetchPage(url) {
      if (cache.has(url)) return cache.get(url);

      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Fetch failed');
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      cache.set(url, doc);
      return doc;
    }

    function syncMetadata(newDoc) {
      document.title = newDoc.title || document.title;
      const newMeta = newDoc.querySelector('meta[name="description"]');
      const oldMeta = document.querySelector('meta[name="description"]');
      if (newMeta && oldMeta) oldMeta.setAttribute('content', newMeta.getAttribute('content'));

      // Sync body attributes (critical for page-specific CSS)
      const newBody = newDoc.body;
      document.body.className = newBody.className;
      Array.from(newBody.attributes).forEach(attr => {
        if (attr.name !== 'class') document.body.setAttribute(attr.name, attr.value);
      });
    }

    function executeScripts(container) {
      const scripts = container.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }

    async function navigateTo(url, isPopState = false) {
      if (isTransitioning) return;
      const currentUrl = location.href;
      if (url === currentUrl && !isPopState) return;

      isTransitioning = true;
      document.dispatchEvent(new CustomEvent('router:before-nav', { detail: { url } }));

      try {
        showLoadingSpinner();
        const oldWrapper = findWrapper(document);
        await runTransitionOut(oldWrapper);

        const newDoc = await fetchPage(url);
        const newWrapper = findWrapper(newDoc);

        if (!newWrapper) {
          location.href = url;
          return;
        }

        syncMetadata(newDoc);
        if (!isPopState) history.pushState({ url }, '', url);

        const activeWrapper = findWrapper(document);
        activeWrapper.replaceWith(newWrapper.cloneNode(true));

        const freshWrapper = findWrapper(document);
        executeScripts(freshWrapper);

        if (config.scrollToTop) window.scrollTo({ top: 0, behavior: 'instant' });

        // Dispatch events for components to re-init
        document.dispatchEvent(
          new CustomEvent('router:page-changed', {
            detail: { url, page: freshWrapper.dataset.page },
          })
        );

        await runTransitionIn(freshWrapper);
      } catch (err) {
        console.error('[Router] Navigation failed:', err);
        location.href = url;
      } finally {
        hideLoadingSpinner();
        isTransitioning = false;
        document.dispatchEvent(new CustomEvent('router:after-nav', { detail: { url } }));
      }
    }

    function showLoadingSpinner() {
      if (!config.showLoadingIndicator) return;
      loadingTimer = setTimeout(() => {
        if (!loadingOverlay) {
          loadingOverlay = document.createElement('div');
          loadingOverlay.className = 'page-loading-overlay';
          loadingOverlay.innerHTML = '<div class="page-loading-spinner"></div>';
          document.body.appendChild(loadingOverlay);
        }
        loadingOverlay.classList.add('show');
      }, config.loadingThreshold);
    }

    function hideLoadingSpinner() {
      clearTimeout(loadingTimer);
      if (loadingOverlay) loadingOverlay.classList.remove('show');
    }

    function init(userConfig = {}) {
      config = { ...config, ...userConfig };

      document.addEventListener('click', e => {
        if (e.defaultPrevented) return;
        const anchor = e.target.closest('a');
        if (
          !anchor ||
          !isInternalLink(anchor) ||
          anchor.target === '_blank' ||
          anchor.hasAttribute('data-no-transition') ||
          isAnchorLink(anchor)
        )
          return;

        e.preventDefault();
        navigateTo(anchor.href);
      });

      window.addEventListener('popstate', e => {
        navigateTo(location.href, true);
      });

      // Cache initial page
      cache.set(location.href, document);
      console.info('[Router] Active');
    }

    return { init, navigateTo };
  })();

  window.PageTransitions = PageTransitions;
})(window, document);
