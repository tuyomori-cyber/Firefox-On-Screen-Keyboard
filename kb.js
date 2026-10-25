browser.webNavigation.onCompleted.addListener(function (details) {
    browser.tabs.sendMessage(details.tabId,JSON.stringify({"directive":"insertKeyboard"}));
});

browser.runtime.onMessageExternal.addListener(function (message) {
    if (message?.type !== "fxosk.frame.request" || message.version !== 1) {
        return false;
    }
    return Promise.resolve({
        type: "fxosk.frame.response",
        version: 1,
        url: browser.runtime.getURL("keyboard-frame.html")
    });
});
