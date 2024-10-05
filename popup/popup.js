document.getElementById('applyChanges').addEventListener('click', () => {
    const darkModeEnabled = document.getElementById('darkModeToggle').checked;
    const highlightEnabled = document.getElementById('highlightToggle').checked;
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "darkModeToggle", enabled: darkModeEnabled });
      chrome.tabs.sendMessage(tabs[0].id, { type: "highlightToggle", enabled: highlightEnabled });
    });
  });
  