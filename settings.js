// Default settings
const DEFAULT_SETTINGS = {
  highlightEnabled: true,
  highlightColor: '#ff4444',
  highlightStyle: 'border',
  autoRedirectEnabled: false
};

// DOM elements
const highlightEnabledCheckbox = document.getElementById('highlightEnabled');
const autoRedirectEnabledCheckbox = document.getElementById('autoRedirectEnabled');
const highlightStyleSelect = document.getElementById('highlightStyle');
const highlightColorInput = document.getElementById('highlightColor');
const colorValue = document.getElementById('colorValue');
const previewLink = document.getElementById('previewLink');
const saveButton = document.getElementById('saveButton');
const resetButton = document.getElementById('resetButton');
const saveMessage = document.getElementById('saveMessage');
const styleSettings = document.getElementById('styleSettings');
const colorSettings = document.getElementById('colorSettings');

// Load settings from storage
function loadSettings() {
  browser.storage.sync.get(DEFAULT_SETTINGS).then(settings => {
    highlightEnabledCheckbox.checked = settings.highlightEnabled;
    autoRedirectEnabledCheckbox.checked = settings.autoRedirectEnabled;
    highlightStyleSelect.value = settings.highlightStyle;
    highlightColorInput.value = settings.highlightColor;
    colorValue.textContent = settings.highlightColor;

    updatePreview();
    toggleSettingsVisibility();
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    highlightEnabled: highlightEnabledCheckbox.checked,
    autoRedirectEnabled: autoRedirectEnabledCheckbox.checked,
    highlightStyle: highlightStyleSelect.value,
    highlightColor: highlightColorInput.value
  };

  browser.storage.sync.set(settings).then(() => {
    showSaveMessage('Settings saved successfully!', 'success');
    updatePreview();
  }).catch(error => {
    showSaveMessage('Error saving settings: ' + error, 'error');
  });
}

// Reset to default settings
function resetSettings() {
  browser.storage.sync.set(DEFAULT_SETTINGS).then(() => {
    loadSettings();
    showSaveMessage('Settings reset to defaults!', 'success');
  });
}

// Update preview link style
function updatePreview() {
  const enabled = highlightEnabledCheckbox.checked;
  const style = highlightStyleSelect.value;
  const color = highlightColorInput.value;

  // Clear previous styles
  previewLink.style.border = '';
  previewLink.style.backgroundColor = '';
  previewLink.style.outline = '';
  previewLink.style.outlineOffset = '';
  previewLink.style.borderBottom = '';
  previewLink.style.borderRadius = '';
  previewLink.style.removeProperty('--bundle-deal-color');

  if (enabled) {
    // Set CSS variable for the badge color
    previewLink.style.setProperty('--bundle-deal-color', color);

    switch (style) {
      case 'border':
        previewLink.style.border = `2px solid ${color}`;
        previewLink.style.borderRadius = '6px';
        break;
      case 'background':
        previewLink.style.backgroundColor = color + '33'; // Add transparency
        previewLink.style.borderRadius = '6px';
        break;
      case 'outline':
        previewLink.style.outline = `2px solid ${color}`;
        previewLink.style.outlineOffset = '2px';
        break;
      case 'underline':
        previewLink.style.borderBottom = `3px solid ${color}`;
        break;
    }
  } else {
    // Remove the badge class when disabled
    previewLink.classList.remove('aliexpress-bundle-deal');
  }

  // Add back the badge class if enabled
  if (enabled && !previewLink.classList.contains('aliexpress-bundle-deal')) {
    previewLink.classList.add('aliexpress-bundle-deal');
  }
}

// Show save message
function showSaveMessage(message, type) {
  saveMessage.textContent = message;
  saveMessage.className = 'save-message show ' + type;

  setTimeout(() => {
    saveMessage.classList.remove('show');
  }, 3000);
}

// Toggle settings visibility based on enabled state
function toggleSettingsVisibility() {
  const enabled = highlightEnabledCheckbox.checked;

  if (enabled) {
    styleSettings.classList.remove('disabled');
    colorSettings.classList.remove('disabled');
  } else {
    styleSettings.classList.add('disabled');
    colorSettings.classList.add('disabled');
  }
}

// Event listeners
highlightEnabledCheckbox.addEventListener('change', () => {
  toggleSettingsVisibility();
  updatePreview();
});

highlightStyleSelect.addEventListener('change', updatePreview);

highlightColorInput.addEventListener('input', (e) => {
  colorValue.textContent = e.target.value;
  updatePreview();
});

saveButton.addEventListener('click', saveSettings);
resetButton.addEventListener('click', resetSettings);

// Load settings on page load
loadSettings();