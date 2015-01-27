/**
 *
 */

const Cc = require("chrome").Cc;
const Ci = require("chrome").Ci;
const SDK = {
    runtime: require("sdk/system/runtime"),
    winUtils: require("sdk/window/utils"),
    unload: require("sdk/system/unload")
};

const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

var browserURL = "chrome://browser/content/browser.xul";
if (require("sdk/system/xul-app").name === "SeaMonkey") {
    browserURL = "chrome://navigator/content/navigator.xul";
}

var options = {};
var containerId = {};
var listeners = [];

const create = function(window, opts) {
    options = opts;
    const doc = window.document;
    const util = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
    const windowID = util.outerWindowID;
    const tbbContainer = doc.createElementNS(NS_XUL, "toolbaritem");
    const tbbButton = doc.createElementNS(NS_XUL, "toolbarbutton");
    const buttonId = options.id;
    containerId[buttonId] = buttonId + "Container";
    tbbContainer.appendChild(tbbButton);
    tbbContainer.setAttribute("id", containerId[buttonId]);
    tbbContainer.setAttribute("tooltiptext", options.tooltiptext);
    tbbButton.setAttribute("id", buttonId);
    tbbButton.setAttribute("image", options.image);
    tbbButton.setAttribute("label", options.label);
    tbbButton.setAttribute("class", "toolbarbutton-1");
    tbbButton.addEventListener("command", options.onCommand, true);
    try {
        const toolbox = (doc.getElementById("navigator-toolbox") || doc.getElementById("mail-toolbox"));
        if (toolbox) {
            const inPalette = toolbox.palette.getElementsByAttribute("id", containerId[buttonId]);
            if (inPalette.length === 0) {
                toolbox.palette.appendChild(tbbContainer);
            }
        }
    }
    catch (e) {
        console.error(e);
    }
    var toolbar = doc.getElementById("nav-bar");
    if (toolbar === "hidden") {
        return;
    }
    if (require("sdk/system/xul-app").name === "SeaMonkey") {
        toolbar = doc.getElementById("nav-bar");
    }
    if (!toolbar) {
        toolbar = toolbarbuttonExists(doc, containerId[buttonId]);
    }
    if (toolbar) {
        let b4;
        if (!b4) {
            const currentset = toolbar.getAttribute("currentset").split(",");
            let i = currentset.indexOf(containerId[buttonId]) + 1;
            if (i > 0) {
                const len = currentset.length;
                for (; i < len; i++) {
                    b4 = doc.getElementById(currentset[i]);
                    if (b4) break;
                }
            }
        }
        toolbar.insertItem && toolbar.insertItem(containerId[buttonId], b4, null, false);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        doc.persist(toolbar.id, "currentset");
    }
    window.addEventListener("close", function () {
        try {
            tbbContainer.parentNode.removeChild(tbbContainer);
            window.removeEventListener("aftercustomization", saveNodeInfo, false);
        } catch (e) {
        }
    });
};

const toolbarbuttonExists = function(doc, id) {
    const toolbars = doc.getElementsByTagNameNS(NS_XUL, "toolbar");
    for (var i = toolbars.length - 1; ~i; i--) {
        if ((new RegExp("(?:^|,)" + id + "(?:,|$)")).test(toolbars[i].getAttribute("currentset")))
            return toolbars[i];
    }
    return false;
};

exports.setIcon = function (tab_id, pathToImage) {
    for (var window of SDK.winUtils.windows(null, {includePrivate: true})) {
        if (browserURL != window.location) {
            continue;
        }
        const button = window.document.getElementById(buttonId);
        if (!button) {
            continue;
        }
        button.setAttribute("image", pathToImage);
    }
};

exports.create = create;

const remove = function() {
    for (var window of SDK.winUtils.windows(null, {includePrivate: true})) {
        const doc = window.document;
        try {
            for (var key in containerId) {
                const container = doc.getElementById(containerId[key]);
                if (!container) {
                    continue;
                }
                container.parentNode.removeChild(container);
                const toolbox = (doc.getElementById("navigator-toolbox") || doc.getElementById("mail-toolbox"));
                if (toolbox) {
                    console.error("containerId[key] " + containerId[key]);
                    const inPalette = toolbox.palette.getElementsByAttribute("id", containerId[key]);
                    if (inPalette.length === 1) {
                        toolbox.palette.removeChild(inPalette[0]);
                    }
                    for (var i = 0; i < listeners.length; i++) {
                        window.removeEventListener("aftercustomization", listeners[i], false);
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
        containerId = {};
    }
    listeners = [];
};
exports.remove = remove;

SDK.unload.when(remove);
