document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const customStylingToggle = document.getElementById('customStylingToggle');
  const gray700Input = document.getElementById('gray700');
  const whiteInput = document.getElementById('white');
  const restoreDefaultsBtn = document.getElementById('restoreDefaults');

  // Switch between tabs
  tabs.forEach(tab => {
      tab.addEventListener('click', function () {
          tabs.forEach(t => t.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));

          const tabId = this.getAttribute('data-tab');
          document.getElementById(tabId).classList.add('active');
          this.classList.add('active');
      });
  });

//   // Load saved settings from Chrome storage
//   chrome.storage.sync.get(['customStylingEnabled', 'customGray700', 'customWhite'], function (result) {
//       customStylingToggle.checked = result.customStylingEnabled || false;
//       gray700Input.value = result.customGray700 || '#424242';  // Default value
//       whiteInput.value = result.customWhite || '#ffffff';  // Default value

//       if (customStylingToggle.checked) {
//           applyCustomStyling(result.customGray700, result.customWhite);
//       }
//   });

//   // Toggle custom styling on/off
//   customStylingToggle.addEventListener('change', function () {
//       const isEnabled = this.checked;
//       chrome.storage.sync.set({ customStylingEnabled: isEnabled });

//       if (isEnabled) {
//           applyCustomStyling(gray700Input.value, whiteInput.value);
//       } else {
//           removeCustomStyling();
//       }
//   });

//   // Update custom gray700 color
//   gray700Input.addEventListener('input', function () {
//       const color = this.value;
//       chrome.storage.sync.set({ customGray700: color });
//       if (customStylingToggle.checked) {
//           applyCustomStyling(gray700Input.value, whiteInput.value);
//       }
//   });

//   // Update custom white color
//   whiteInput.addEventListener('input', function () {
//       const color = this.value;
//       chrome.storage.sync.set({ customWhite: color });
//       if (customStylingToggle.checked) {
//           applyCustomStyling(gray700Input.value, whiteInput.value);
//       }
//   });

//   // Restore default settings
//   restoreDefaultsBtn.addEventListener('click', function () {
//       chrome.storage.sync.remove(['customStylingEnabled', 'customGray700', 'customWhite'], function () {
//           customStylingToggle.checked = false;
//           gray700Input.value = '#424242';  // Reset to default
//           whiteInput.value = '#ffffff';  // Reset to default
//           removeCustomStyling();
//       });
//   });

//   // Apply custom styling by updating CSS variables
//   function applyCustomStyling(gray700, white) {
//       const agentTurnElements = document.querySelectorAll('.agent-turn');
//       agentTurnElements.forEach(el => {
//           el.style.setProperty('--gray-700', gray700);
//           el.style.setProperty('--white', white);
//       });
//   }

//   // Remove custom styling and restore defaults
//   function removeCustomStyling() {
//       const agentTurnElements = document.querySelectorAll('.agent-turn');
//       agentTurnElements.forEach(el => {
//           el.style.removeProperty('--gray-700');
//           el.style.removeProperty('--white');
//       });
//   }
});
