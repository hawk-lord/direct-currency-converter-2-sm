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
const button_id ="direct-currency-converter-toggle-button";

// array for listener nuking
var listeners = [],
// array for storing window ids already populated
 buttonedWindows = [];

function create(window, opts) {
    options = opts;
    let doc = window.document;

    // create() currently runs on every tab activation since window events are not working at this time.
    // Because of the above, we need to check if button is already present for this window
    // TODO: alternatively, we could add a prop to this level and just check that as a flag...
    var util = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
    var windowID = util.outerWindowID;

    // create toolbar button
    let tbbContainer = doc.createElementNS(NS_XUL, "toolbaritem");
    let tbbStack = doc.createElementNS(NS_XUL, "stack");
    let tbbButton = doc.createElementNS(NS_XUL, "toolbarbutton");
    // let tbbBadge = doc.createElementNS(NS_XUL, "label");

    tbbContainer.appendChild(tbbStack);

    tbbStack.appendChild(tbbButton);

    tbbContainer.setAttribute("id", button_id);
    tbbContainer.setAttribute("label", options.label);
    tbbContainer.setAttribute("tooltiptext", options.tooltiptext);

    tbbButton.setAttribute("id", "ghostery-button");
    tbbButton.setAttribute("type", "button");
    tbbButton.setAttribute("image", options.image);
    tbbButton.setAttribute("label", options.label);
    tbbButton.setAttribute("class", "toolbarbutton-1");

    tbbButton.addEventListener("command", options.onCommand, true);

    // add toolbarbutton to palette
    try {
        var inPalette = (doc.getElementById("navigator-toolbox") || doc.getElementById("mail-toolbox"))
            .palette.getElementsByAttribute( "id", button_id );

        if (inPalette.length === 0) {
            (doc.getElementById("navigator-toolbox") || doc.getElementById("mail-toolbox"))
                .palette.appendChild(tbbContainer);
        }
    }
    catch (e) {
        console.error(e);
    }

    // find a toolbar to insert the toolbarbutton into
    var toolbar = doc.getElementById("nav-bar");

    if (toolbar === "hidden") {
        // toolbar is set to hidden which means user removed the icon
        return;
    }

    if (require("sdk/system/xul-app").name === "SeaMonkey") {
        toolbar = doc.getElementById("nav-bar");
    }

    if (!toolbar) {
        var toolbar = toolbarbuttonExists(doc, button_id);
    }

    // found a toolbar to use?
    if (toolbar) {
        let b4;

        if (!b4) {
            let currentset = toolbar.getAttribute("currentset").split(",");
            let i = currentset.indexOf(button_id) + 1;

            // was the toolbarbutton id found in the curent set?
            if (i > 0) {
                let len = currentset.length;
                // find a toolbarbutton to the right which actually exists
                for (; i < len; i++) {
                    b4 = doc.getElementById(currentset[i]);
                    if (b4) break;
                }
            }
        }

        toolbar.insertItem && toolbar.insertItem(button_id, b4, null, false);
        toolbar.setAttribute("currentset", toolbar.currentSet);

        try {
            // adding keyset
            var keyset = doc.createElement("keyset"), keyelem = doc.createElement("key");
            keyset.id = "ghostery-keyset";

            keyelem.setAttribute("id", "ghostery-finder-key");
            keyelem.setAttribute("oncommand", "void(0);");
            keyelem.addEventListener("command", function() { tbbButton.click(); }, true);

            keyelem.setAttribute("key", "g");
            keyelem.setAttribute("modifiers", "alt control");

            keyset.appendChild(keyelem);
            doc.getElementById("main-window").appendChild(keyset);
        } catch (err) {
            // wrong main window.
        }

        doc.persist(toolbar.id, "currentset");
    }

    window.addEventListener("close", function() {
        try {
            tbbContainer.parentNode.removeChild(tbbContainer);
            window.removeEventListener("aftercustomization", saveNodeInfo, false);
        } catch (e) {
            // tripped when window never had successful container injecttion
        }
    });
}

function toolbarbuttonExists(doc, id) {
    var toolbars = doc.getElementsByTagNameNS(NS_XUL, "toolbar");

    for (var i = toolbars.length - 1; ~i; i--) {
        if ((new RegExp("(?:^|,)" + id + "(?:,|$)")).test(toolbars[i].getAttribute("currentset")))
            return toolbars[i];
    }

    return false;
}


exports.moveTo = function(toolbarID) {
    // change the current position for open windows
    for (var window of SDK.winUtils.windows(null, { includePrivate: true })) {
        // window = SDK.winUtils.windows(null, { includePrivate: true })[window];

        if (browserURL != window.location) return;

        let doc = window.document;

        // if it is already in the window, abort
        if (doc.getElementById(button_id)) return;

        var tb = doc.getElementById(toolbarID),
         b4;

        if (tb) {
            tb.insertItem(button_id, b4, null, false);
            tb.setAttribute("currentset", tb.currentSet);
            doc.persist(tb.id, "currentset");

            // save where it was moved to
            //prefs("badgeLocation", toolbarID);
        }
    }
}

exports.setIcon = function(tab_id, pathToImage) {
    for (var window of SDK.winUtils.windows(null, { includePrivate: true })) {
        // window = SDK.winUtils.windows(null, { includePrivate: true })[window];

        if (browserURL != window.location) { continue; }
        // if (tab_id != SDK.tabsLib.getTabForWindow(window.content).id) { continue; }

        var button = window.document.getElementById("ghostery-button");

        if (!button) { continue; }
        button.setAttribute("image", pathToImage);
    }
}

exports.create = create;

function remove() {
    for (var window of SDK.winUtils.windows(null, { includePrivate: true })) {
        // window = SDK.winUtils.windows(null, { includePrivate: true })[window];

        let doc = window.document;

        try {
            var container = doc.getElementById(button_id);


            if (!container) { continue; }

            // removing button
            container.parentNode.removeChild(container);

            // removing palette entries
            var inPalette = (doc.getElementById("navigator-toolbox") || doc.getElementById("mail-toolbox")).palette.getElementsByAttribute( "id", button_id );
            if (inPalette.length === 1) {
                (doc.getElementById("navigator-toolbox") || doc.getElementById("mail-toolbox")).palette.removeChild(inPalette[0]);
            }

            // removing listeners
            for (var i = 0; i < listeners.length; i++) {
                window.removeEventListener("aftercustomization", listeners[i], false);
            }
        } catch (e) {
            console.log(e.toString());
            // tripped when window never had successful container injection
        }
    }

    listeners = [];
}

exports.remove = remove;

// Unloader.
SDK.unload.when(remove);
