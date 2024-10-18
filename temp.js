let condition = true;

function func1() {

    //something somthn...

    function func3() {

        if (condition == true) {
            console.log('true');
        }
    }

    func2.func3 = func3;
}

function func2() {

    const abc = 5;
    func2.abc = abc;

    if (func2.func3) {
        func2.func3();
    }
}

const REGEX_CLASS_SCROLL_TO_BOTTOM = /react-scroll-to-bottom/g,
    SELECTOR_SCROLL_TO_BOTTOM = '[class^="react-scroll-to-bottom"]',
    CLASS_REPLACEMENT = "dont-scroll-to-bottom";

// Scroll-to-bottom mutation observer
new MutationObserver(() => {
    document.querySelectorAll(SELECTOR_SCROLL_TO_BOTTOM).forEach((element) => {
        element.className = element.className.replace(REGEX_CLASS_SCROLL_TO_BOTTOM, CLASS_REPLACEMENT);
        element.style.overflowY = "auto";
    });
}).observe(document.body, { childList: true, subtree: true });

// // Scroll-to-bottom mutation observer
// new MutationObserver(() => {
//     document.querySelectorAll(SELECTOR_SCROLL_TO_BOTTOM).forEach((element) => {
//         element.className = element.className.replace(REGEX_CLASS_SCROLL_TO_BOTTOM, CLASS_REPLACEMENT);
//         element.style.overflowY = "auto";
//     });

// }).observe(document.body, { childList: true, subtree: true });


// const TARGET_CLASS = 'react-scroll-to-bottom--css-wjwqj-1n7m0yu';

// // Monitor changes to elements with the specified class
// const monitorClassChanges = (element) => {
//     const originalClassName = element.className;
//     console.log("Monitoring class changes on:", element);

//     // Observe attribute changes (to detect class modifications)
//     const observer = new MutationObserver((mutationsList) => {
//         mutationsList.forEach((mutation) => {
//             if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
//                 const currentClassName = mutation.target.className;
//                 console.log(`Class changed from "${originalClassName}" to "${currentClassName}"`);

//                 // Check if scroll functionality is associated with this class
//                 if (currentClassName.includes(TARGET_CLASS)) {
//                     console.log("Scroll-related class is active:", currentClassName);
//                 } else {
//                     console.log("Scroll-related class has been modified or removed.");
//                 }
//             }
//         });
//     });

//     observer.observe(element, {
//         attributes: true, // Monitor attribute changes (class name)
//         attributeFilter: ['class'], // Focus on class attribute changes
//     });

//     console.log("Class monitoring setup complete.");
// };

// // Set up a MutationObserver to find the element with the class
// const observer2 = new MutationObserver((mutationsList) => {
//     mutationsList.forEach((mutation) => {
//         mutation.addedNodes.forEach((node) => {
//             if (node.nodeType === 1 && node.className.includes(TARGET_CLASS)) {
//                 console.log("Element with scroll class detected:", node);
//                 monitorClassChanges(node); // Set up class monitoring
//             }
//         });
//     });
// });

// // Observe the document body for changes
// observer2.observe(document.body, {
//     childList: true,
//     subtree: true,
// });

// // Fallback in case the element is already present
// const existingElement = document.querySelector(`.${TARGET_CLASS}`);
// if (existingElement) {
//     console.log("Element already present:", existingElement);
//     monitorClassChanges(existingElement);
// }
