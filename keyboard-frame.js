/* global fxKeyboard */
(function () {
    function sendKey(key) {
        window.parent.postMessage({type: "fxosk.key", version: 1, key: key}, "*");
    }

    function reportVisibility(open) {
        window.parent.postMessage({type: "fxosk.visibility", version: 1, open: open}, "*");
    }

    function initialize() {
        fxKeyboard._sendKey = sendKey;
        fxKeyboard.activeOSK = fxKeyboard.inputTypes.keyboard;
        // insertKeyboard() internally closes the keyboard once. Do not report
        // that initialization-only close to the embedding page.
        fxKeyboard.insertKeyboard(fxKeyboard.inputTypes.keyboard);
        var toggleOpen = fxKeyboard._toggleOpen.bind(fxKeyboard);
        fxKeyboard._toggleOpen = function (open) {
            toggleOpen(open);
            reportVisibility(open);
        };
        fxKeyboard._toggleOpen(true);
    }

    window.addEventListener("message", function (event) {
        if (event.source !== window.parent || event.data?.type !== "fxosk.show" || event.data.version !== 1) {
            return;
        }
        fxKeyboard._toggleOpen(true);
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, {once: true});
    } else {
        initialize();
    }
}());
