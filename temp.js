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

