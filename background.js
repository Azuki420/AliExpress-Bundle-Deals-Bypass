// Default settings
const DEFAULT_SETTINGS = {
  highlightEnabled: true,
  highlightColor: '#ff4444',
  highlightStyle: 'border',
  autoRedirectEnabled: false
};

// Initialize settings
browser.storage.sync.get(DEFAULT_SETTINGS).then(settings => {
  if (!settings.highlightEnabled) {
    settings.highlightEnabled = DEFAULT_SETTINGS.highlightEnabled;
  }
  if (!settings.highlightColor) {
    settings.highlightColor = DEFAULT_SETTINGS.highlightColor;
  }
  if (!settings.highlightStyle) {
    settings.highlightStyle = DEFAULT_SETTINGS.highlightStyle;
  }
  if (settings.autoRedirectEnabled === undefined) {
    settings.autoRedirectEnabled = DEFAULT_SETTINGS.autoRedirectEnabled;
  }
  browser.storage.sync.set(settings);
});

// Create context menu item (right-click)
browser.contextMenus.create({
  id: "open-aliexpress-product",
  title: "Open AliExpress Product",
  contexts: ["link"]
});

// Handle context menu click
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-aliexpress-product") {
    const href = info.linkUrl || "";
    const id = extractAliId(href);
    if (id) {
      openAliItem(id);
    } else {
      alertInTab(tab.id, "No product ID found in the link.");
    }
  }
});

// Click on extension icon in toolbar
browser.browserAction.onClicked.addListener((tab) => {
  // Open settings page instead of trying to extract from current page
  browser.runtime.openOptionsPage();
});

// Opens new tab with link
function openAliItem(id) {
  const target = `https://aliexpress.com/item/${id}.html`;
  browser.tabs.create({ url: target });
}

// Sends alert to current page
function alertInTab(tabId, message) {
  browser.tabs.executeScript(tabId, {
    code: `alert(${JSON.stringify(message)});`
  }).catch(() => console.log("Failed to show alert"));
}

// Check if URL is a Bundle Deal
function isBundleDealUrl(url) {
  if (!url) return false;
  const decoded = decodeURIComponent(url);
  return /BundleDeals/i.test(decoded) || /productIds=/i.test(decoded);
}

// Extracts product ID from various URL formats
function extractAliId(url) {
  if (!url) return null;
  try {
    const decoded = decodeURIComponent(url);

    // 1) productIds=1005006904562409:...
    let m = /[?&]productIds=([^&]+)/i.exec(decoded);
    if (m && m[1]) {
      const candidate = m[1].split(":")[0].match(/\d{6,}/);
      if (candidate) return candidate[0];
    }

    // 2) x_object_id:1005006904562409
    m = /x_object_id[:%253A]+(\d{6,})/i.exec(decoded);
    if (m && m[1]) return m[1];

    // 3) /item/1005006904562409.html
    m = /\/item\/(\d{6,})\.html/i.exec(decoded);
    if (m && m[1]) return m[1];

    // 4) productId= or object_id=
    m = /[?&](?:productId|object_id)=?(\d{6,})/i.exec(decoded);
    if (m && m[1]) return m[1];

    // 5) fallback - first long number sequence
    m = decoded.match(/\d{10,16}/);
    if (m) return m[0];
  } catch (e) {
    console.error("extractAliId error", e);
  }
  return null;
}