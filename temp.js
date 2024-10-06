// Run `manipulateMessages` on page load to apply changes to existing messages
document.addEventListener('DOMContentLoaded', () => {
    manipulateMessages();
});

// Observer to monitor dynamic content (new messages or conversation changes)
const observer = new MutationObserver((mutations) => {
    let newContentDetected = false;

    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
                if (node.tagName.toLowerCase() === 'article') {
                    newContentDetected = true;  // Detect new articles
                } else if (node.querySelectorAll && node.querySelectorAll('article').length > 0) {
                    newContentDetected = true;  // Detect any container that contains articles
                }
            }
        });

        mutation.removedNodes.forEach(node => {
            if (node.nodeType === 1 && node.querySelectorAll && node.querySelectorAll('article').length > 0) {
                newContentDetected = true;  // Detect when articles are removed (e.g., conversation switch)
            }
        });
    });

    if (newContentDetected) {
        manipulateMessages();  // Apply changes when new or removed content is detected
    }
});

// Start observing the document for changes
observer.observe(document.body, { childList: true, subtree: true });

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// Function to manipulate articles (add bookmark buttons and scroll shortcuts)
function manipulateMessages() {
    createScrollPercentageCircle();
    createArticleShortcuts();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// Create shortcut buttons for each article
function createArticleShortcuts() {
    const shortcutContainer = document.createElement('div');
    shortcutContainer.id = 'shortcutContainer';
    document.body.appendChild(shortcutContainer);

    const articles = document.querySelectorAll('article');

    articles.forEach((article, index) => {
        const shortcutButton = document.createElement('div');
        shortcutButton.classList.add('shortcutButton');
        shortcutButton.innerText = index + 1;  // Number the buttons
        shortcutButton.addEventListener('click', () => {
            article.scrollIntoView({ behavior: 'smooth' });  // Scroll to the article when clicked
        });
        shortcutContainer.appendChild(shortcutButton);
    });
    // Find the parent element of all article elements
    const chatContainer = document.querySelector('article')?.parentElement.parentElement;
    if (chatContainer) {
        // Attach the scroll event listener to the chat container only (remove window listener)
        chatContainer.addEventListener('scroll', updateShortcutPositions);
    }

    updateShortcutPositions();  // Initially position the buttons
}

// Update shortcut button positions based on the current scroll
function updateShortcutPositions() {
    const articles = document.querySelectorAll('article');
    const shortcutButtons = document.querySelectorAll('.shortcutButton');
    const windowHeight = window.innerHeight;
    const centerY = windowHeight / 2;  // Center of the screen

    articles.forEach((article, index) => {
        const articleRect = article.getBoundingClientRect();
        const shortcutButton = shortcutButtons[index];

        // Calculate the distance from the center of the screen
        // const distanceFromCenter = articleRect.top - centerY + articleRect.height / 2; // relative position
        // const distanceFromCenter = (articleRect.top - centerY + articleRect.height / 2) / 10; // divided relative position
        const distanceFromCenter = (articleRect.top - centerY + articleRect.height / 2) / 10; // divided relative position

        // Adjust the button position to match the article's relative position
        shortcutButton.style.top = `${centerY + distanceFromCenter}px`;
    });
}

// Create the scroll percentage circle
function createScrollPercentageCircle() {
    if (document.getElementById('scrollPercentageCircle')) return;  // Avoid re-creating the scroll circle if it already exists

    const scrollCircle = document.createElement('div');
    scrollCircle.id = 'scrollPercentageCircle';
    document.body.appendChild(scrollCircle);

    // Find the parent element of all article elements
    const chatContainer = document.querySelector('article')?.parentElement.parentElement;

    if (chatContainer) {
        // Update the percentage inside the circle
        updateScrollPercentage(chatContainer);

        // Attach the scroll event listener to the chat container
        chatContainer.addEventListener('scroll', () => updateScrollPercentage(chatContainer));
    } else {
        console.error("Chat container not found.");
    }
}

// Update the scroll percentage based on the container's scroll position
function updateScrollPercentage(container) {
    const scrollCircle = document.getElementById('scrollPercentageCircle');
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    let scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);
    scrollPercentage = isNaN(scrollPercentage) ? 0 : scrollPercentage;
    
    // Display the percentage inside the circle
    scrollCircle.innerText = `${scrollPercentage}%`;
}