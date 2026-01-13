// Content script to highlight Bundle Deal links
(function() {
  let settings = {
    highlightEnabled: true,
    highlightColor: '#ff4444',
    highlightStyle: 'border'
  };

  // Load settings
  browser.storage.sync.get(['highlightEnabled', 'highlightColor', 'highlightStyle']).then(result => {
    settings = { ...settings, ...result };
    if (settings.highlightEnabled) {
      highlightBundleDeals();
    }
  });

  // Listen for settings changes
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      if (changes.highlightEnabled) {
        settings.highlightEnabled = changes.highlightEnabled.newValue;
      }
      if (changes.highlightColor) {
        settings.highlightColor = changes.highlightColor.newValue;
      }
      if (changes.highlightStyle) {
        settings.highlightStyle = changes.highlightStyle.newValue;
      }
      
      // Refresh highlights
      removeHighlights();
      if (settings.highlightEnabled) {
        highlightBundleDeals();
      }
    }
  });

  function isBundleDealUrl(url) {
    if (!url) return false;
    try {
      const decoded = decodeURIComponent(url);
      return /BundleDeals/i.test(decoded) || /productIds=/i.test(decoded);
    } catch (e) {
      return false;
    }
  }

  function highlightBundleDeals() {
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (isBundleDealUrl(href)) {
        link.classList.add('aliexpress-bundle-deal');
        link.setAttribute('data-bundle-deal', 'true');
        applyHighlightStyle(link);
      }
    });
  }

  function applyHighlightStyle(element) {
    const color = settings.highlightColor;
    
    // Set CSS variable for the badge color
    element.style.setProperty('--bundle-deal-color', color);
    
    switch (settings.highlightStyle) {
      case 'border':
        element.style.border = `2px solid ${color}`;
        element.style.borderRadius = '4px';
        break;
      case 'background':
        element.style.backgroundColor = color + '33'; // Add transparency
        element.style.borderRadius = '4px';
        break;
      case 'outline':
        element.style.outline = `2px solid ${color}`;
        element.style.outlineOffset = '2px';
        break;
      case 'underline':
        element.style.borderBottom = `3px solid ${color}`;
        break;
    }
  }

  function removeHighlights() {
    const links = document.querySelectorAll('a[data-bundle-deal="true"]');
    links.forEach(link => {
      link.classList.remove('aliexpress-bundle-deal');
      link.removeAttribute('data-bundle-deal');
      link.style.border = '';
      link.style.backgroundColor = '';
      link.style.outline = '';
      link.style.outlineOffset = '';
      link.style.borderBottom = '';
      link.style.borderRadius = '';
      link.style.removeProperty('--bundle-deal-color');
    });
  }

  // Observe DOM changes for dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    if (settings.highlightEnabled) {
      highlightBundleDeals();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial highlight
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (settings.highlightEnabled) {
        highlightBundleDeals();
      }
    });
  }
})();