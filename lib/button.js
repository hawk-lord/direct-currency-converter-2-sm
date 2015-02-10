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
var containerIds = [];
var listeners = [];
var eventAggregator = null;
/**
 *
 * @param window
 * @param opts
 */
const createButton = function(anEventAggregator, window, opts) {
    if (!eventAggregator) {
        eventAggregator = anEventAggregator;
    }
    options = opts;
    const doc = window.document;
    // const util = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
    // const windowID = util.outerWindowID;
    const tbbContainer = doc.createElementNS(NS_XUL, "toolbaritem");
    const tbbButton = doc.createElementNS(NS_XUL, "toolbarbutton");
    const buttonId = options.id;
    const containerId = options.id + "-container";
    containerIds.push(containerId);
    tbbContainer.appendChild(tbbButton);
    tbbContainer.setAttribute("id", containerId);
    // FIXME restore labels
    //tbbContainer.setAttribute("label", options.label);
    //tbbContainer.setAttribute("tooltiptext", options.tooltiptext);
    // Shown in palette, also as tooltip
    tbbContainer.setAttribute("label", "tbbContainer.label");
    // Not shown in palette. Shown in nav-bar if button.tooltiptext is not set
    tbbContainer.setAttribute("tooltiptext", "tbbContainer.tooltiptext");
    tbbButton.setAttribute("id", buttonId);
    tbbButton.setAttribute("image", options.image);
    // tbbButton.setAttribute("label", options.label);
    // tbbButton.setAttribute("tooltiptext", options.tooltiptext);
    // Shown in nav-bar
    tbbButton.setAttribute("label", "tbbButton.label");
    // Shown in nav-bar
    tbbButton.setAttribute("tooltiptext", "tbbButton.tooltiptext");
    tbbButton.setAttribute("class", "toolbarbutton-1");
    tbbButton.addEventListener("command", options.onCommand, true);
    try {
        const toolbox = (doc.getElementById("navigator-toolbox") || doc.getElementById("mail-toolbox"));
        if (toolbox) {
            const inPalette = toolbox.palette.getElementsByAttribute("id", containerId);
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
        toolbar = toolbarbuttonExists(doc, containerId);
    }
    if (toolbar && options.show) {
        let beforeNode;
        if (!beforeNode) {
            const currentset = toolbar.getAttribute("currentset").split(",");
            let i = currentset.indexOf(containerId) + 1;
            if (i > 0) {
                const len = currentset.length;
                for (; i < len; i++) {
                    beforeNode = doc.getElementById(currentset[i]);
                    if (beforeNode) break;
                }
            }
        }
        const id = containerId;
        const wrapper = null;
        const beforePermanent = false;
        toolbar.insertItem && toolbar.insertItem(id, beforeNode, wrapper, beforePermanent);
        toolbar.setAttribute("currentset", toolbar.currentSet);
        doc.persist(toolbar.id, "currentset");
    }

    const saveNodeInfo = function(event) {
        const window = event.currentTarget;
        const document = window.document;
        if (!document.getElementById("direct-currency-converter-action-button-container")
            || document.getElementById("direct-currency-converter-action-button-container").parentNode.id === "BrowserToolbarPalette") {
            eventAggregator.publish("dccActionButtonHidden");
        }
        else {
            eventAggregator.publish("dccActionButtonVisible");
        }
        if (!document.getElementById("direct-currency-converter-toggle-button-container")
            || document.getElementById("direct-currency-converter-toggle-button-container").parentNode.id === "BrowserToolbarPalette") {
            eventAggregator.publish("dccToggleButtonHidden");
        }
        else {
            eventAggregator.publish("dccToggleButtonVisible");
        }
    };

    window.addEventListener("aftercustomization", saveNodeInfo, false);
    // listeners.push(saveNodeInfo);

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

exports.createButton = createButton;

const removeButtons = function(aReason) {
    if (aReason === "shutdown") {
        return;
    }
    for (var window of SDK.winUtils.windows(null, {includePrivate: true})) {
        const doc = window.document;
        //const util = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
        //const windowID = util.outerWindowID;
        try {
            for (var containerId of containerIds) {
                const container = doc.getElementById(containerId);
                if (!container) {
                    continue;
                }
                container.parentNode.removeChild(container);
                const toolbox = (doc.getElementById("navigator-toolbox") || doc.getElementById("mail-toolbox"));
                if (toolbox) {
                    const inPalette = toolbox.palette.getElementsByAttribute("id", containerId);
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
    }
    containerIds = {};
    listeners = [];
};

SDK.unload.when(removeButtons);
