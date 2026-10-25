/* global fxKeyboard */
(function () {
    function sendKey(key) {
        window.parent.postMessage({type: "fxosk.key", version: 1, key: key}, "*");
    }

    function initialize() {
        fxKeyboard._sendKey = sendKey;
        fxKeyboard.activeOSK = fxKeyboard.inputTypes.keyboard;
        fxKeyboard.insertKeyboard(fxKeyboard.inputTypes.keyboard);
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
