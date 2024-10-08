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
    // Find the parent element of all article elements
    const chatContainer = document.querySelector('article')?.parentElement.parentElement;

    articles.forEach((article, index) => {
        const shortcutButton = document.createElement('div');
        shortcutButton.classList.add('shortcutButton');
        shortcutButton.innerText = index + 1;  // Number the buttons
        shortcutButton.addEventListener('click', () => {
            const chatContainer = document.querySelector('article')?.parentElement.parentElement;
            const articleRect = article.getBoundingClientRect();
            const containerRect = chatContainer.getBoundingClientRect();
            const windowHeight = chatContainer.clientHeight;
        
            // Calculate the target scroll position inside the chat container so that the article's top is 20% from the top
            const targetScrollPosition = chatContainer.scrollTop + (articleRect.top - containerRect.top) - (windowHeight * 0.2);
        
            // Scroll the chat container smoothly to the calculated position
            chatContainer.scrollTo({
                top: targetScrollPosition,
                behavior: 'smooth'
            });
        });
        
        shortcutContainer.appendChild(shortcutButton);
    });

    if (chatContainer) {
        // Attach the scroll event listener to the chat container only (remove window listener)
        chatContainer.addEventListener('scroll', updateShortcutPositions);
    }

    updateShortcutPositions();  // Initially position the buttons
}

// Update shortcut button positions based on scroll, using `lastPos` to prevent overlap
function updateShortcutPositions() {
    const articles = document.querySelectorAll('article');
    const shortcutButtons = document.querySelectorAll('.shortcutButton');
    const windowHeight = window.innerHeight;
    const centerY = windowHeight / 2;
    const viewTop = windowHeight * 0.25;
    const viewBottom = windowHeight * 0.75;

    let lastPos = null;  // Track the last position to prevent overlap

    articles.forEach((article, index) => {
        const articleRect = article.getBoundingClientRect();
        const shortcutButton = shortcutButtons[index];

        // Calculate the distance from the center of the screen
        let distanceFromCenter = (articleRect.top - centerY) / 25; // Reduced distance

        // Prevent overlap by ensuring distance grows if too close
        if (lastPos !== null && distanceFromCenter < lastPos) {
            distanceFromCenter = lastPos;
        }
        lastPos = distanceFromCenter + 50; // Update lastPos for the next button

        // Set the button position to match the article's relative position
        shortcutButton.style.top = `${centerY + distanceFromCenter}px`;
        shortcutButton.style.position = 'fixed';  // Ensure buttons stay in place

        // Check if article is in view
        const articleInView = !(articleRect.bottom < viewTop || articleRect.top > viewBottom);

        if (articleInView) {
            shortcutButton.style.transform = 'scale(1.2)';  // Scale up the button
            shortcutButton.style.backgroundColor = '#007bff';  // Change color to blue (you can modify the color)
            shortcutButton.style.color = 'white';  // Ensure text is readable
        } else {
            shortcutButton.style.transform = 'scale(1)';  // Normal scale
            shortcutButton.style.backgroundColor = '#333';  // Default background color
            shortcutButton.style.color = 'white';  // Default text color
        }
    });
}


// Create the scroll percentage circle
function createScrollPercentageCircle() {
    if (document.getElementById('scrollPercentageCircle')) return;

    const scrollCircle = document.createElement('div');
    scrollCircle.id = 'scrollPercentageCircle';
    document.body.appendChild(scrollCircle);

    const chatContainer = document.querySelector('article')?.parentElement.parentElement;

    if (chatContainer) {
        updateScrollPercentage(chatContainer);
        chatContainer.addEventListener('scroll', () => updateScrollPercentage(chatContainer));
    }
}

// Update the scroll percentage based on container's scroll position
function updateScrollPercentage(container) {
    const scrollCircle = document.getElementById('scrollPercentageCircle');
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    let scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);
    scrollPercentage = isNaN(scrollPercentage) ? 0 : scrollPercentage;
    
    scrollCircle.innerText = `${scrollPercentage}%`;
}