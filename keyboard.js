/*
 FxKeyboard
 Version: 1.10.1
 Author:  Travis Fitzgerald
 Date:    23 March 2021
 Purpose: A virtual keyboard for Firefox
 */

const storageData = browser.storage.local.get();

storageData.then(storedSetup, onError);

function storedSetup(settings) {
	if (!settings.hasOwnProperty("scaleValue") || settings.scaleValue === null) {
		browser.storage.local.set({
			scaleValue: 100,
		});
		settings.scaleValue = 100;
	}
	fxKeyboard.settings.scale = Number(settings.scaleValue) / 100;
	console.log(fxKeyboard.settings.scale);
}

function onError(error) {
	console.log("Failed to get stored data from internal storage");
}

var xpath = {
    getXPathOfElement: function (elt)
    {
        var path = "";
        for (; elt && elt.nodeType == 1; elt = elt.parentNode)
        {
            idx = xpath.getElementIdx(elt);
            xname = elt.tagName;
            if (idx > 1)
                xname += "[" + idx + "]";
            path = "/" + xname + path;
        }
        return path;
    },
    
    getElementIdx: function (elt)
    {
        var count = 1;
        for (var sib = elt.previousSibling; sib; sib = sib.previousSibling)
        {
            if (sib.nodeType == 1 && sib.tagName == elt.tagName)
                count++
        }

        return count;
    }
};

var FxKeyboardLocale = JSON.stringify({
    name: "Japanese (JIS)",
    locale: "ja",
    defaultFlex: "1",
    main: [
        [
            ["1", "!"], ["2", '"'], ["3", "#"], ["4", "$"],
            ["5", "%"], ["6", "&"], ["7", "'"], ["8", "("],
            ["9", ")"], ["0", ""], ["-", "="], ["^", "~"],
            ["¥", "|"], [{label: "← Backspace", special: 8, flex: 2, type: "repeat"}]
        ], [
            [{label: "Tab", string: "\\t", flex: 1.5}],
            ["q", "Q"], ["w", "W"], ["e", "E"], ["r", "R"],
            ["t", "T"], ["y", "Y"], ["u", "U"], ["i", "I"],
            ["o", "O"], ["p", "P"], ["@", "`"], ["[", "{"]
        ], [
            [{label: "Shift", flex: 1.5, special: "shift"}],
            ["a", "A"], ["s", "S"], ["d", "D"], ["f", "F"],
            ["g", "G"], ["h", "H"], ["j", "J"], ["k", "K"],
            ["l", "L"], [";", "+"], [":", "*"], ["]", "}"],
            [{label: "Enter", flex: 2, special: 13}]
        ], [
            ["z", "Z"], ["x", "X"], ["c", "C"], ["v", "V"],
            ["b", "B"], ["n", "N"], ["m", "M"], [",", "<"],
            [".", ">"], ["/", "?"], ["\\", "_"]
        ], [
            [{label: "◀", flex: 1, special: "ArrowLeft"}],
            [{label: "▶", flex: 1, special: "ArrowRight"}],
            [{label: "Space", flex: 7, special: 32}],
            [{label: "Print Screen", flex: 2, placeholder: true}],
            [{label: "Close", special: "closeFX", flex: 1.5}]
        ]
    ]
});

var FxKeyMap = '{' +
        '"`": 192,' +
        '"~": 192,' +
        '"1": 49,' +
        '"!": 49,' +
        '"2": 50,' +
        '"@": 50,' +
        '"3": 51,' +
        '"#": 51,' +
        '"4": 52,' +
        '"$": 52,' +
        '"5": 53,' +
        '"%": 53,' +
        '"6": 54,' +
        '"^": 54,' +
        '"7": 55,' +
        '"&": 55,' +
        '"8": 56,' +
        '"*": 56,' +
        '"9": 57,' +
        '"(": 57,' +
        '"0": 48,' +
        '")": 48,' +
        '"-": 173,' +
        '"_": 173,' +
        '"=": 61,' +
        '"+": 61,' +
        '"Delete": 8,' +
        '"q": 81,' +
        '"w": 87,' +
        '"e": 69,' +
        '"r": 82,' +
        '"t": 84,' +
        '"y": 89,' +
        '"u": 85,' +
        '"i": 73,' +
        '"o": 79,' +
        '"p": 80,' +
        '"[": 219,' +
        '"{": 219,' +
        '"}": 221,' +
        '"]": 221,' +
        '"\\\\": 220,' +
        '"|": 220,' +
        '"a": 65,' +
        '"s": 83,' +
        '"d": 68,' +
        '"f": 70,' +
        '"g": 71,' +
        '"h": 72,' +
        '"j": 74,' +
        '"k": 75,' +
        '"l": 76,' +
        '";": 59,' +
        '":": 59,' +
        '"\'": 222,' +
        '"\\"": 222,' +
        '"Enter": 13,' +
        '"z": 90,' +
        '"x": 88,' +
        '"c": 67,' +
        '"v": 86,' +
        '"b": 66,' +
        '"n": 78,' +
        '"m": 77,' +
        '",": 188,' +
        '"<": 188,' +
        '".": 190,' +
        '">": 190,' +
        '"/": 191,' +
        '"?": 191' +
        '}';
        

var fxKeyboard = {

    settings: {
        repeat_all: true,
        keep_closed: false,
        startingURL: document.location.href,
        locale_default: 'en',
        secScaleX: 0,
        secScaleY: 0,
        scale: 1,
        preScale: 0,
        padding: 8,
        kb_max_width: window.innerWidth,
        kb_max_height: 5 * (Math.max(52, Math.min(window.innerWidth * 0.06, window.innerHeight * 0.11)) + 8) + 16,
		key_height: Math.max(52, Math.min(window.innerWidth * 0.06, window.innerHeight * 0.11))
    },
    
    hierarchy: {
        isMaster: true,
        pathInMaster: null,
        slavedIFrame: null
    },

    _toggleOpen: function (open) {
        if (document.getElementById(this.activeOSK) === null) {
            this.insertKeyboard(this.activeOSK);
        }
        try {
            var kb = document.getElementById(this.activeOSK);
            kb.style.zIndex = "9999999";
        } catch (e) {
            console.log("OSK not found");
            return;
        }
        if (open) {
            if (!this.hierarchy.isMaster) {
                window.parent.postMessage(JSON.stringify({"directive": "master", "command": 
                            {"input": fxKeyboard.activeOSK, "state": open, "elementYTop": this.focusElementYTop, "elementYBottom": this.focusElementYBottom}
                    , "xpath": this.hierarchy.pathInMaster, "uri": this.settings.startingURL}), "*");
            } else {
                var wasOpen = kb.style.display === 'block';
                if (!wasOpen) {
                    if (this.previousOSK !== null ? this.previousOSK !== this.activeOSK && document.getElementById(fxKeyboard.previousOSK).style.display !== "none" : false) {
                        document.getElementById(this.previousOSK).style.display = "none";
                    }
                    kb.style.display = "block";
                    this.previousOSK = this.activeOSK;
                }
				kb.style.width = this.getMaxWidth(this.activeOSK) * this.settings.scale + "px";
				kb.style.height = this.getMaxHeight(this.activeOSK) * this.settings.scale + "px";
				kb.style.padding = this.settings.padding * this.settings.scale + "px";
				kb.style.fontFamily = "arial,sans-serif";
				kb.style.color = "#000000";
				kb.style.fontSize = 35 * this.settings.scale + "px";
				kb.style.borderRadius = 5 * this.settings.scale + "px";
				for (const element of kb.childNodes) {
					element.style.height = (this.settings.key_height + this.settings.padding) * this.settings.scale + "px";
					for (const chNodes of element.childNodes) {
						chNodes.style.width = this.settings.key_height * this.settings.scale + "px";
						chNodes.style.height = this.settings.key_height * this.settings.scale + "px";
						chNodes.style.margin = this.settings.padding * (this.settings.scale / 2) + "px";
						chNodes.style.borderRadius = 5*this.settings.scale+"px";
					}
				}
                this._layoutMainRows(kb);
                this._fitSpecialLabels(kb);
                if (!wasOpen || this.positionedFocusElement !== this.focusElement ||
                        (this.focusElement === null && (this.positionedFocusTop !== this.focusElementYTop ||
                        this.positionedFocusBottom !== this.focusElementYBottom))) {
                    var keyboardHeight = kb.getBoundingClientRect().height;
                    var bottomOverlap = Math.max(0, Math.min(this.focusElementYBottom, window.innerHeight) -
                        Math.max(this.focusElementYTop, window.innerHeight - keyboardHeight));
                    var topOverlap = Math.max(0, Math.min(this.focusElementYBottom, keyboardHeight) -
                        Math.max(this.focusElementYTop, 0));
                    var showAtTop = bottomOverlap > topOverlap;
                    kb.style.top = showAtTop ? "0px" : "";
                    kb.style.bottom = showAtTop ? "" : "0px";
                    this.positionedFocusElement = this.focusElement;
                    this.positionedFocusTop = this.focusElementYTop;
                    this.positionedFocusBottom = this.focusElementYBottom;
                }
            }
        } else {
            if (!this.hierarchy.isMaster) {
                window.parent.postMessage(JSON.stringify({"directive": "master", "command": {"input": this.activeOSK, "state": open}}), "*");
            } else {
                kb.style.display = "none";
                this.focusElement = null;
                this.positionedFocusElement = null;
            }
        }
    },
	
	_isOSKOpen: function() {
		var kb = document.getElementById(this.activeOSK);
		return kb != null ? kb.style.display === 'block' : false;
	},

    _fitSpecialLabels: function (kb) {
        var context = document.createElement("canvas").getContext("2d");
        if (!context) return;
        var maxFontSize = 35 * this.settings.scale;
        context.font = maxFontSize + "px arial, sans-serif";
        for (var key of kb.getElementsByClassName("fxkey-special")) {
            var availableWidth = Math.max(1, key.getBoundingClientRect().width - 16 * this.settings.scale);
            var textWidth = context.measureText(key.textContent).width;
            key.style.fontSize = Math.min(maxFontSize, maxFontSize * availableWidth / Math.max(1, textWidth)) + "px";
        }
    },

    _layoutMainRows: function (kb) {
        if (kb.id !== this.inputTypes.keyboard) {
            return;
        }
        var aRow = kb.children[2];
        var zRow = kb.children[3];
        var scale = this.settings.scale;
        var padding = this.settings.padding * scale;
        var margin = padding / 2;
        var gap = padding;
        var keyHeight = this.settings.key_height * scale;
        var rowHeight = keyHeight + gap;
        var rowWidth = this.settings.kb_max_width * scale - 2 * padding;
        var normalWidth = Math.max(1, (rowWidth - 2 * margin - 13 * gap) / 15.5);
        var shiftWidth = normalWidth * 1.5;
        var aStart = margin + shiftWidth + gap;
        var zStart = aStart + normalWidth / 2;
        var enterTopLeft = aStart + 12 * (normalWidth + gap);
        var enterBottomLeft = zStart + 11 * (normalWidth + gap);
        var right = rowWidth - margin;
        var enterIndent = enterTopLeft - enterBottomLeft;

        for (var row of [aRow, zRow]) {
            row.style.display = "block";
            row.style.position = "relative";
            row.style.height = rowHeight + "px";
        }
        for (var key of aRow.children) {
            var index = Number(key.dataset.keyIndex);
            key.style.position = "absolute";
            key.style.flex = "none";
            key.style.margin = "0";
            key.style.top = margin + "px";
            key.style.boxSizing = "border-box";
            if (index === 0) {
                key.style.left = margin + "px";
                key.style.width = shiftWidth + "px";
                key.style.height = (2 * keyHeight + gap) + "px";
                key.style.zIndex = "1";
            } else if (index === 13) {
                key.style.left = enterBottomLeft + "px";
                key.style.width = (right - enterBottomLeft) + "px";
                key.style.height = (2 * keyHeight + gap) + "px";
                key.style.paddingLeft = enterIndent + "px";
                key.style.clipPath = "polygon(" + enterIndent + "px 0, 100% 0, 100% 100%, 0 100%, 0 " + rowHeight + "px, " + enterIndent + "px " + rowHeight + "px)";
                key.style.zIndex = "1";
            } else {
                key.style.left = (aStart + (index - 1) * (normalWidth + gap)) + "px";
                key.style.width = normalWidth + "px";
                key.style.height = keyHeight + "px";
            }
        }
        for (var zKey of zRow.children) {
            var zIndex = Number(zKey.dataset.keyIndex);
            zKey.style.position = "absolute";
            zKey.style.flex = "none";
            zKey.style.margin = "0";
            zKey.style.top = margin + "px";
            zKey.style.left = (zStart + zIndex * (normalWidth + gap)) + "px";
            zKey.style.width = normalWidth + "px";
            zKey.style.height = keyHeight + "px";
            zKey.style.boxSizing = "border-box";
        }
    },

    /* Shift stays on until Shift is pressed again. */
    state: 0,
    lastPress: "null",
    keepOpen: false,
    focusElement: null,
    positionedFocusElement: null,
    positionedFocusTop: null,
    positionedFocusBottom: null,
    focusElementYBottom: 0,
    focusElementYTop: 0,
    inputTypes: {"keyboard": "fxkeyboard"},
    previousOSK: null,
    activeOSK: null,
    
    _setSpecialFunctions: function(keyD,obj) {
        keyD.onmousedown = function(){keyD.style.backgroundColor = "rgb(150,150,150)";};
        keyD.onmouseenter = function(){keyD.style.backgroundColor = "rgb(200,200,200)";};
        keyD.onmouseout = function(){keyD.style.backgroundColor = "rgb(255,255,255)";};
        
        if (obj.label === "Shift") {
            keyD.onmouseup = function(){
                fxKeyboard.state = fxKeyboard.state === 0 ? 1 : 0;
                fxKeyboard._setShift();
            };
        } else if (obj.special === 8) {
            keyD.onmouseup = function () {
                fxKeyboard._sendKey("Backspace");
                keyD.style.backgroundColor = "rgb(255,255,255)";
            };
        } else if (obj.label in {"@":"",".com":"",".au":""}) {
            keyD.onmouseup = function () {
                fxKeyboard._sendKey(obj.label);
                keyD.style.backgroundColor = "rgb(255,255,255)";
            };
        } else if (obj.label === "Space") {
            keyD.onmouseup = function () {
                fxKeyboard._sendKey(" ");
                keyD.style.backgroundColor = "rgb(255,255,255)";
            };
        } else if (obj.special === "ArrowLeft" || obj.special === "ArrowRight") {
            keyD.onmouseup = function () {
                fxKeyboard._sendKey(obj.special);
                keyD.style.backgroundColor = "rgb(255,255,255)";
            };
        } else if (obj.label === "Close") {
            keyD.onmouseup = function () {
                fxKeyboard._toggleOpen(false);
                keyD.style.backgroundColor = "rgb(255,255,255)";
                fxKeyboard.lastPress = "close";
            };
        } else if (obj.label === "Enter") {
            keyD.onmouseup = function () {
                keyD.style.backgroundColor = "rgb(255,255,255)";
				fxKeyboard._sendKey(obj.label);
            };
        } else if (obj.label === "Tab") {
			keyD.onmouseup = function () {
				keyD.style.backgroundColor = "rgb(255,255,255)";
				var focussableElements = 'input:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
				console.log(document.activeElement);
				console.log(document.activeElement.form);
				if (document.activeElement && document.activeElement.form) {
					var focussable = Array.prototype.filter.call(document.activeElement.form.querySelectorAll(focussableElements),
							function (element) {
								return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
							});
					console.log(focussable);
					var index = focussable.indexOf(document.activeElement);
					focussable[index+1 >= focussable.length ?  0 : index+1].focus();
				}
			};
		}
			
        return keyD;
    },
    
    _setShift: function () {
        var shiftK = document.getElementById("fxkey-shift");
        if (shiftK) {
            var shiftColor = this.state === 1 ? "rgb(150,150,150)" : "rgb(255,255,255)";
            shiftK.style.backgroundColor = shiftColor;
            shiftK.onmouseout = function(){shiftK.style.backgroundColor = shiftColor;};
        }
        if (this.state > 0) {
            var secElements = document.getElementsByClassName("fxkey-secondary");
            var priElements = document.getElementsByClassName("fxkey-primary");
            for (var i = 0; secElements.length > i; i++) {
                secElements[i].style.display = "flex";
            }
            for (var i = 0; priElements.length > i; i++) {
                priElements[i].style.display = "none";
            }
        } else if (this.state === 0) {
            var secElements = document.getElementsByClassName("fxkey-secondary");
            var priElements = document.getElementsByClassName("fxkey-primary");
            for (var i = 0; secElements.length > i; i++) {
                secElements[i].style.display = "none";
            }
            for (var i = 0; priElements.length > i; i++) {
                priElements[i].style.display = "flex";
            }
        }
    },
    
    _sendKey: function (character) {
        if (fxKeyboard.hierarchy.isMaster && fxKeyboard.hierarchy.slavedIFrame != null) {
            fxKeyboard.hierarchy.slavedIFrame.contentWindow.postMessage(JSON.stringify({"directive": "slave", "command": "sendKey", "key": character}), "*");
        } else {
            switch (character) {
                case "Backspace":
                case "Delete":
                    var deleteField = fxKeyboard.focusElement;
                    if (typeof deleteField.selectionStart === "number" && typeof deleteField.setRangeText === "function") {
                        var deleteStart = deleteField.selectionStart < deleteField.selectionEnd
                            ? deleteField.selectionStart : Math.max(0, deleteField.selectionStart - 1);
                        deleteField.setRangeText("", deleteStart, deleteField.selectionEnd, "start");
                    } else {
                        deleteField.value = deleteField.value.slice(0, -1);
                    }
                    break;
                case "ArrowLeft":
                case "ArrowRight":
                    var field = fxKeyboard.focusElement;
                    if (typeof field.selectionStart === "number" && typeof field.setSelectionRange === "function") {
                        var position = character === "ArrowLeft"
                            ? (field.selectionStart < field.selectionEnd ? field.selectionStart : Math.max(0, field.selectionStart - 1))
                            : (field.selectionStart < field.selectionEnd ? field.selectionEnd : Math.min(field.value.length, field.selectionEnd + 1));
                        field.setSelectionRange(position, position);
                    }
                    return;
                case "Enter":
                    fxKeyboard.focusElement.dispatchEvent(new KeyboardEvent("beforeinput", {"key": character, "shiftKey": false, "keyCode": (JSON.parse(FxKeyMap))[character]}));
                    fxKeyboard.focusElement.dispatchEvent(new KeyboardEvent("keydown", {"key": character, "shiftKey": false, "code": character, "keyCode": (JSON.parse(FxKeyMap))[character]}));
                    fxKeyboard.focusElement.dispatchEvent(new KeyboardEvent("keyup", {"key": character, "shiftKey": false, "code": character, "keyCode": (JSON.parse(FxKeyMap))[character]}));
                    if (fxKeyboard.focusElement.parentNode.nodeName === 'FORM') {
                        fxKeyboard.focusElement.parentNode.submit();
                    }
                    break;
                default:
                    var inputField = fxKeyboard.focusElement;
                    if (typeof inputField.selectionStart === "number" && typeof inputField.setRangeText === "function") {
                        inputField.setRangeText(character, inputField.selectionStart, inputField.selectionEnd, "end");
                    } else {
                        inputField.value = inputField.value === null ? "" + character : inputField.value + character;
                    }

            }

            fxKeyboard.focusElement.dispatchEvent(new Event("keydown", {"bubbles": true, "cancelable": true}));
            fxKeyboard.focusElement.dispatchEvent(new Event("keypress", {"bubbles": true, "cancelable": true}));
            fxKeyboard.focusElement.dispatchEvent(new Event("keyup", {"bubbles": true, "cancelable": true}));
            fxKeyboard.focusElement.dispatchEvent(new Event('input', {"bubbles": true, "cancelable": true}));
            fxKeyboard.focusElement.dispatchEvent(new Event('change', {"bubbles": true, "cancelable": true}));
        }
    },
    
    _buildKey: function (char,primary) {
        var key = document.createElement("div");
        key.style.width = this.settings.key_height*this.settings.scale + "px";
        key.style.height = this.settings.key_height*this.settings.scale + "px";
        key.style.margin = this.settings.padding*(this.settings.scale/2) + "px";
        key.style.flex = "1 1 0";
        key.style.minWidth = "0";
        if (primary) {
            key.id = "fxkey-primary";
            key.className = "fxkey-primary";
            key.style.display = "flex";
        } else {
            key.id = "fxkey-secondary";
            key.className = "fxkey-secondary";
            key.style.display = "none";
        }
        key.style.alignItems = "center";
        key.style.justifyContent = "center";
        key.style.borderRadius = 5*this.settings.scale+"px";
        key.style.cursor = "pointer";
        key.style.backgroundColor = "rgb(255,255,255)";
        key.innerHTML = char;
        key.onmouseenter = function(){key.style.backgroundColor = "rgb(200,200,200)";};
        key.onmouseout = function(){key.style.backgroundColor = "rgb(255,255,255)";};
        key.onmousedown = function () {
            key.style.backgroundColor = "rgb(150,150,150)";
        };
        key.onmouseup = function () {
            key.style.backgroundColor = "rgb(200,200,200)";
            if (char.indexOf("&#") !== -1) {
                char = key.innerHTML;
            }
            fxKeyboard._sendKey(char);
        };
        return key;
    },
	
	_buildKeyFlex: function (char,primary,flex) {
        var key = document.createElement("div");
        key.style.width = this.settings.key_height*this.settings.scale + "px";
        key.style.height = this.settings.key_height*this.settings.scale + "px";
        key.style.margin = this.settings.padding*(this.settings.scale/2) + "px";
        if (primary) {
            key.id = "fxkey-primary";
            key.className = "fxkey-primary";
            key.style.display = "flex";
        } else {
            key.id = "fxkey-secondary";
            key.className = "fxkey-secondary";
            key.style.display = "none";
        }
        key.style.alignItems = "center";
        key.style.justifyContent = "center";
        key.style.borderRadius = 5*this.settings.scale+"px";
        key.style.cursor = "pointer";
		key.style.flexGrow = flex;
        key.style.backgroundColor = "rgb(255,255,255)";
        key.innerHTML = char;
		console.log("FlexGrow of standard key is: "+key.style.flexGrow);
        key.onmouseenter = function(){key.style.backgroundColor = "rgb(200,200,200)";};
        key.onmouseout = function(){key.style.backgroundColor = "rgb(255,255,255)";};
        key.onmousedown = function () {
            key.style.backgroundColor = "rgb(150,150,150)";
        };
        key.onmouseup = function () {
            key.style.backgroundColor = "rgb(200,200,200)";
            if (char.indexOf("&#") !== -1) {
                char = key.innerHTML;
            }
            fxKeyboard._sendKey(char);
        };
        return key;
    },
    
    _buildSpecialKey: function (obj) {
        var key = document.createElement("div");
        key.className = "fxkey-special";
        key.style.width = this.settings.key_height*this.settings.scale + "px";
        key.style.height = this.settings.key_height*this.settings.scale + "px";
        key.style.margin = this.settings.padding*(this.settings.scale/2) + "px";
        key.style.flexBasis = "0";
        key.style.minWidth = "0";
        key.style.display = "flex";
        key.style.alignItems = "center";
        key.style.justifyContent = "center";
        key.style.whiteSpace = "nowrap";
        key.style.cursor = "pointer";
        key.style.flexGrow = obj.flex;
        key.id = "fxkey-"+obj.label.toLowerCase();
        key.style.borderRadius = 5*this.settings.scale + "px";
        key.style.backgroundColor = "rgb(255,255,255)";
        key = this._setSpecialFunctions(key,obj);
        key.innerHTML = obj.label;
        if (obj.placeholder) {
            key.title = "このキーの動作は未実装です";
            key.style.backgroundColor = "rgb(220,230,239)";
            key.style.cursor = "default";
            key.onmousedown = null;
            key.onmouseenter = null;
            key.onmouseout = null;
        }
        return key;
    },

    insertKeyboard: function (inputType) {
        var keyb;
		var max_width = this.getMaxWidth(inputType);
		var max_height = this.getMaxHeight(inputType);
        if (document.getElementById(inputType)) {
            return;
        }
        var keys = JSON.parse(FxKeyboardLocale);
        //create main Div
        keyb = document.createElement("div");
        // parse keyboard keys JSON
        
        keyb.setAttribute("tabIndex","-1");
        keyb.style.backgroundColor = "rgba(0,0,0,0.6)";
        keyb.style.width = max_width*this.settings.scale + "px";
        keyb.style.height = max_height*this.settings.scale + "px";
        keyb.style.boxSizing = "border-box";
        keyb.style.padding = this.settings.padding*this.settings.scale + "px";
        keyb.style.fontFamily = "arial,sans-serif";
        keyb.style.color = "#000000";
        keyb.style.fontSize = 35*this.settings.scale+"px";
        keyb.style.borderRadius = 5*this.settings.scale+"px";
        keyb.style.textAlign = "center";
        keyb.style.position = "fixed"; 
        keyb.style.left = "50%";
        keyb.style.bottom = 0;
        keyb.style.transform = "translateX(-50%)";
        keyb.id = inputType;
        keyb.style.zIndex = "9999999";
        keyb.style.display = "none"; //hidden on insert.
		console.log("border radius: "+ keyb.style.borderRadius+ " padding size: "+keyb.style.padding);
        if (!document.getElementById(inputType) || this.settings.preScale !== this.settings.scale) {
            if (this.settings.preScale !== this.settings.scale) {
                var rows = document.getElementsByClassName(inputType+"-r");
                if (rows.length > 0) {
                    for (var row in rows) {
                        document.body.removeChild(rows[row]);
                    }
                }
            }
            for (var row in keys.main) {
                var nrow = document.createElement("div");
                nrow.style.display = "flex";
                nrow.style.justifyContent = "center";
                nrow.style.height = (this.settings.key_height + this.settings.padding) * this.settings.scale + "px";
                nrow.id = inputType+'-r';
                nrow.class = inputType+'-r';
                for (var button in keys.main[row]) {
                    if (keys.main[row][button][0].constructor === {}.constructor) {
                        var nkey = this._buildSpecialKey(keys.main[row][button][0]);
                        nkey.dataset.keyIndex = button;
                        nrow.appendChild(nkey);
                    } else {
						if (keys.main[row][button].length > 2) {
							var nkeyprimary = this._buildKeyFlex(keys.main[row][button][0], true, keys.main[row][button][2]);
						} else {
							var nkeyprimary = this._buildKey(keys.main[row][button][0], true);
						}
                        nkeyprimary.dataset.keyIndex = button;
                        nrow.appendChild(nkeyprimary);
                        if (keys.main[row].length > 1) {
							if (keys.main[row][button].length > 2) {
								var nkeysecondary = this._buildKeyFlex(keys.main[row][button][1], false, keys.main[row][button][2]);
							} else {
								var nkeysecondary = this._buildKey(keys.main[row][button][1], false);
							}
                            nkeysecondary.dataset.keyIndex = button;
                            nrow.appendChild(nkeysecondary);
                        }
                    }
                }
                keyb.appendChild(nrow);
            }
        }
        document.body.appendChild(keyb);
        this._layoutMainRows(keyb);
        this.settings.preScale = this.settings.scale;
        this._toggleOpen(false);
    },
	
	getMaxWidth: function (inputType) {
		return this.settings.kb_max_width;
	},
	
	getMaxHeight: function (inputType) {
		return this.settings.kb_max_height;
	}
};

browser.runtime.onMessage.addListener(function begin(message) {
    msg = JSON.parse(message);
    if (msg.directive === "insertKeyboard") {
        if (fxKeyboard.hierarchy.isMaster) {
            window.parent.postMessage(JSON.stringify({"directive":"master","command":"ping","uri":fxKeyboard.settings.startingURL}),"*");
        }
        if (document.getElementById("fxkeyboard") === null && fxKeyboard.hierarchy.isMaster) {
            console.log("Inserting OSK");
            fxKeyboard.activeOSK = fxKeyboard.inputTypes.keyboard;
            fxKeyboard.insertKeyboard(fxKeyboard.inputTypes.keyboard);
        }
    }
});

window.addEventListener("message", function messageReceived(event) {
    msg = JSON.parse(event.data);
    if (msg.directive === "slave") {
        switch (msg.command) {
            case "initialize":
				var preOpen = fxKeyboard._isOSKOpen();
				if (fxKeyboard.hierarchy.isMaster) {
					fxKeyboard._toggleOpen(false);
				}
                fxKeyboard.hierarchy.isMaster = false;
                fxKeyboard.hierarchy.pathInMaster = msg.xpath;
				if (preOpen) {
					fxKeyboard._toggleOpen(preOpen);
				}
                break;
            case "sendKey":
                fxKeyboard._sendKey(msg.key);
                break;
            case "updateXPath":
                fxKeyboard.hierarchy.pathInMaster = msg.xpath;
                break;
        }
    }
    
    if (msg.directive === "master" && fxKeyboard.hierarchy.isMaster) {
        if (typeof msg.command === 'object') {
            fxKeyboard.activeOSK = msg.command.input;
            if (msg.command.state) {
                fxKeyboard.hierarchy.slavedIFrame = document.evaluate(msg.xpath, document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                fxKeyboard.focusElementYTop = msg.command.elementYTop + fxKeyboard.hierarchy.slavedIFrame.getBoundingClientRect().top;
                fxKeyboard.focusElementYBottom = msg.command.elementYBottom + fxKeyboard.hierarchy.slavedIFrame.getBoundingClientRect().top;
                if (fxKeyboard.hierarchy.slavedIFrame == null) {
                    fxKeyboard.hierarchy.slavedIFrame = document.querySelector('iframe[src="' + msg.uri + '"]');
                    fxKeyboard.hierarchy.slavedIFrame.contentWindow.postMessage(JSON.stringify({"directive": "slave", "command": "updateXPath", "xpath": xpath.getXPathOfElement(fxKeyboard.hierarchy.slavedIFrame)}), "*");
                }
                fxKeyboard._toggleOpen(msg.command.state);
            } else {
                fxKeyboard._toggleOpen(msg.command.state);
                fxKeyboard.hierarchy.slavedIFrame = null;
            }
        } else if (msg.command == "ping") {
            var iframe = document.querySelector('iframe[src="' + msg.uri + '"]');
            iframe.contentWindow.postMessage(JSON.stringify({"directive": "slave", "command": "initialize", "xpath": xpath.getXPathOfElement(iframe)}), "*");
        }
    }
}, false);

document.addEventListener("mousedown", function load(clicked) {
    if (clicked.target.id.indexOf("fxkey") !== -1) {
        clicked.preventDefault();
    }
});

document.addEventListener("mouseup", function load(clicked) {
    if (clicked.target.id.indexOf("fxkey") !== -1) {
        clicked.preventDefault();
    }

    oskAction(clicked);
});

document.addEventListener("focusin", function load(clicked) {
    if (clicked.target.id.indexOf("fxkey") !== -1) {
        clicked.preventDefault();
    }

    oskAction(clicked);
});

var textInputTypes = {
        'input': '', 'select': '', 'option': '', 'textarea': '', 'textbox': '',
        'text': '', 'password': '', 'url': '', 'color': '', 'date': '', 'datetime': '',
        'datetime-local': '', 'email': '', 'month': '', 'search': ''
    };

var integerInputTypes = {
        'number': '', 'range': '', 'tel': '', 'time': '', 'week': ''
    };

function oskAction(clicked) {
    if ((document.activeElement.type in textInputTypes || document.activeElement.type in integerInputTypes)
            && fxKeyboard.lastPress !== "close") {
        fxKeyboard.focusElement = document.activeElement;
        fxKeyboard.focusElementYTop = document.activeElement.getBoundingClientRect().top;
        fxKeyboard.focusElementYBottom = document.activeElement.getBoundingClientRect().bottom;
        fxKeyboard.activeOSK = fxKeyboard.inputTypes.keyboard;
        fxKeyboard._toggleOpen(true);
    } else {
        if (clicked.target.id.indexOf("fxkey") === -1) {
            fxKeyboard._toggleOpen(false);
            fxKeyboard.lastPress = "null";
        }
    }
}

document.addEventListener("dragstart", function load(clicked) {
    if (clicked.target.id.indexOf("fxkey") !== -1) {
        clicked.preventDefault();
    }
});

document.addEventListener("dragend", function load(clicked) {
    if (clicked.target.id.indexOf("fxkey") !== -1) {
        clicked.preventDefault();
    }
});
