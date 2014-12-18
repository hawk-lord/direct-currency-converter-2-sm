/**
 * https://gist.github.com/Noitidart/9406437#file-bootstrap-js
 */
const { Cc, Ci, Cu } = require("chrome");
//const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const self = {
    id: "Bootstrap-Watch-Host-Event-Listener-Inject-Files",
    suffix: "@jetpack",
    path: "chrome://bootstrap-watch-host-event-listener-inject-files/content/",
    aData: 0
};
const ignoreFrames = true;
const hostPattern = "bing.com"; //if a page load matches this host it will inject into it

Cu.import("resource://gre/modules/Services.jsm");

const eventAggregator = require("./eventAggregator");

function addInjections(theDoc) {
    // SM navigator FF browser
    Cu.reportError("addInjections host = " + theDoc.location.host);
    if (!theDoc) {
        Cu.reportError("no doc!");
        return;
    } //document not provided, it is undefined likely
/*
    if (!(theDoc.location && theDoc.location.host.indexOf(hostPattern) > -1)) {
        Cu.reportError("location not match host:" + theDoc.location.host);
        return;
    }
*/
    //if (!theDoc instanceof Ci.nsIDOMHTMLDocument) { Cu.reportError("not html doc"); return; } //not html document, so it's likely an xul document //you probably don't need this check, checking host is enought
    Cu.reportError("host pass");

    removeInjections(theDoc, true); //remove my div if it was already there, this is just a precaution

/*
    //add your stuff here
    var myIFrame = theDoc.createElement("iframe");
    myIFrame.setAttribute("id", "injected-iframe");
    myIFrame.setAttribute("type", "content");
    //myIFrame.setAttribute("accessibleType","100A");
    myIFrame.setAttribute("src", self.path + "_inject-website.htm");


    var myScript = theDoc.createElement("script");
    myScript.setAttribute("src", self.path + "_inject-script.js");
    myScript.setAttribute("id", "injected-script");

    var myImage = theDoc.createElement("img");
    myImage.setAttribute("src", self.path + "_inject-image.png");
    myImage.setAttribute("id", "injected-image");

    theDoc.documentElement.appendChild(myIFrame);
    theDoc.documentElement.appendChild(myScript);
    theDoc.documentElement.appendChild(myImage);
*/

    console.error(theDoc);
    console.error(theDoc.head);
    if (!theDoc.head)
        return;
    console.error("theDoc.location " + theDoc.location);
    if (theDoc.location.href === "resource://dcc-sm-at-joint-dot-ax/direct-currency-converter-2-sm/data/settings.html" ) {
        if (!theDoc.getElementById("jquery")) {
            var jquery = theDoc.createElement("script");
            jquery.setAttribute("src", "chrome://direct-currency-converter/content/jquery-2.1.1.min.js");
            jquery.setAttribute("id", "jquery");
            theDoc.head.insertBefore(jquery, theDoc.head.firstChild);
        }
        if (!theDoc.getElementById("jqueryUi")) {
            var jqueryUi = theDoc.createElement("script");
            jqueryUi.setAttribute("src", "chrome://direct-currency-converter/content/jquery-ui-1.10.4.min.js");
            jqueryUi.setAttribute("id", "jqueryUi");
            if (!jquery)
                var jquery = theDoc.getElementById("jquery");
            theDoc.head.insertBefore(jqueryUi, jquery.nextSibling);
        }
        if (!theDoc.getElementById("dccSettings")) {
            var dccSettings = theDoc.createElement("script");
            dccSettings.setAttribute("src", "chrome://direct-currency-converter/content/dcc-settings.js");
            dccSettings.setAttribute("id", "dccSettings");
            if (!jqueryUi)
                var jqueryUi = theDoc.getElementById("jqueryUi");
            theDoc.head.insertBefore(dccSettings, jqueryUi.nextSibling);
        }
        if (!theDoc.getElementById("settingsAdapter")) {
            var settingsAdapter = theDoc.createElement("script");
            settingsAdapter.setAttribute("src", "chrome://direct-currency-converter/content/dcc-seamonkey-settings-adapter.js");
            settingsAdapter.setAttribute("id", "settingsAdapter");
            if (!dccSettings)
                var dccSettings = theDoc.getElementById("dccSettings");
            theDoc.head.insertBefore(settingsAdapter, dccSettings.nextSibling);
        }
    }
    else {
        if (!theDoc.getElementById("dccRegexes")) {
            var dccRegexes = theDoc.createElement("script");
            dccRegexes.setAttribute("src", "chrome://direct-currency-converter/content/dcc-regexes.js");
            dccRegexes.setAttribute("id", "dccRegexes");
            theDoc.head.insertBefore(dccRegexes, theDoc.head.firstChild);
        }
        if (!theDoc.getElementById("dccContent")) {
            var dccContent = theDoc.createElement("script");
            dccContent.setAttribute("src", "chrome://direct-currency-converter/content/dcc-content.js");
            dccContent.setAttribute("id", "dccContent");
            if (!dccRegexes)
                var dccRegexes = theDoc.getElementById("dccRegexes");
            theDoc.head.insertBefore(dccContent, dccRegexes.nextSibling);
        }
        if (!theDoc.getElementById("contentAdapter")) {
            var contentAdapter = theDoc.createElement("script");
            contentAdapter.setAttribute("src", "chrome://direct-currency-converter/content/dcc-seamonkey-content-adapter.js");
            contentAdapter.setAttribute("id", "contentAdapter");
            if (!dccSettings)
                var dccSettings = theDoc.getElementById("dccContent");
            theDoc.head.insertBefore(contentAdapter, dccContent.nextSibling);
        }
    }
//    Cu.reportError("settingsAdapter " + settingsAdapter);
}

function removeInjections(theDoc, skipChecks) {
    //Cu.reportError("removeInjections");
    if (!skipChecks) {
        if (!theDoc) {
            Cu.reportError("no doc!");
            return;
        } //document not provided, it is undefined likely
        if (!(theDoc.location && theDoc.location.host.indexOf(hostPattern) > -1)) {
            Cu.reportError("location not match host: " + theDoc.location.host);
            return;
        }
        //if (!theDoc instanceof Ci.nsIDOMHTMLDocument) { Cu.reportError("not html doc"); return; } //not html document, so it's likely an xul document //you probably don't need this check, checking host is enought
    }

    var myScript = theDoc.getElementById("injected-script"); //test if myDiv is in the page
    if (myScript) {
        var alreadyThere = true;
    }
    if (alreadyThere) {
        //my stuff was found in the document so remove it
        var myIFrame = theDoc.getElementById("injected-iframe");
        var myImage = theDoc.getElementById("injected-image");

        myScript.parentNode.removeChild(myScript);
        myIFrame.parentNode.removeChild(myIFrame);
        myImage.parentNode.removeChild(myImage);
    } else {
        //else it's not there so no need to do anything
    }
}

function domContentLoadedEventListener(event) {
    Cu.reportError("EVENT DOMContentLoaded");
    // win:Window → prices-short.html
    var win = event.originalTarget.defaultView;
    // doc:HTMLDocument → prices-short.html
    // var doc = win.document;
    var doc = event.originalTarget;
    Cu.reportError("page loaded loc = " + doc.location);
    if (win.frameElement) {
        //it's a frame
        Cu.reportError("it's a frame");
        if (ignoreFrames) {
            return;//don't want to watch frames
        }
    }
    addInjections(doc);
}

// reload
/*
function domContentLoadedAgainEventListener(event) {
    Cu.reportError("EVENT domContentLoadedAgainEventListener " + event);
    // HTMLDocument
    Cu.reportError("EVENT domContentLoadedAgainEventListener " + event.originalTarget);

    let XULWindows = Services.wm.getXULWindowEnumerator(null);
    while (XULWindows.hasMoreElements()) {
        let aXULWindow = XULWindows.getNext();
        let domWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
        Cu.reportError("EVENT domWindow " + domWindow);
        let tabBrowser = domWindow.gBrowser;
        Cu.reportError("EVENT tabBrowser " + tabBrowser);
        if (tabBrowser) {
            // tabBrowser.contentWindow.postMessage("reload", "*");
        }
    }

}
*/

/*start - windowlistener*/
var windowListener = {
    //DO NOT EDIT HERE
    onOpenWindow: function (aXULWindow) {
        // Wait for the window to finish loading
        // domWindow:ChromeWindow → about:blank
        let domWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
        const loadEventListener = function () {
            Cu.reportError("EVENT 'load' in onOpenWindow");
            // domWindow:ChromeWindow → browser.xul
            // aXULWindow:XPCWrappedNative_NoHelper
            domWindow.removeEventListener("load", arguments.callee, false);
            windowListener.loadIntoWindow(domWindow, aXULWindow);
            eventAggregator.publish("setButton");
            eventAggregator.publish("newWindow", {domWindow: domWindow});
        };

        domWindow.addEventListener("load", loadEventListener, false);
    },
    onCloseWindow: function (aXULWindow) {
    },
    onWindowTitleChange: function (aXULWindow, aNewTitle) {
    },
    register: function () {
        // Load into any existing windows
        let XULWindows = Services.wm.getXULWindowEnumerator(null);
        while (XULWindows.hasMoreElements()) {
            let aXULWindow = XULWindows.getNext();
            let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
            windowListener.loadIntoWindow(aDOMWindow, aXULWindow);
        }
        // Listen to new windows
        Services.wm.addListener(windowListener);
    },
    unregister: function () {
        // Unload from any existing windows
        let XULWindows = Services.wm.getXULWindowEnumerator(null);
        while (XULWindows.hasMoreElements()) {
            let aXULWindow = XULWindows.getNext();
            let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
            windowListener.unloadFromWindow(aDOMWindow, aXULWindow);
        }
        //Stop listening so future added windows don't get this attached
        Services.wm.removeListener(windowListener);
    },
    //END - DO NOT EDIT HERE
    loadIntoWindow: function (aDOMWindow, aXULWindow) {
        if (!aDOMWindow) {
            return;
        }
        if (aDOMWindow.gBrowser) {
            Cu.reportError("aDOMWindow.gBrowser " + aDOMWindow.gBrowser);
            aDOMWindow.gBrowser.addEventListener("DOMContentLoaded", domContentLoadedEventListener, false);
            // aDOMWindow.gBrowser.addEventListener("DOMContentLoaded", domContentLoadedAgainEventListener, false);
            Cu.reportError("aDOMWindow.addEventListener DOMContentLoaded");
            /*
             // Won't work
             aDOMWindow.gBrowser.addEventListener("load", function(event) {
             Cu.reportError("EVENT loadIntoWindow load " + event);
             }, false);
             Cu.reportError("aDOMWindow.addEventListener load");
             aDOMWindow.addEventListener("load", function(event) {
             Cu.reportError("EVENT loadIntoWindow load " + event);
             }, false);
             aDOMWindow.gBrowser.contentWindow.addEventListener("load", function(event) {
             Cu.reportError("EVENT loadIntoWindow load " + event);
             }, false);
             */
            if (aDOMWindow.gBrowser.tabContainer) {
                //has tabContainer
                //start - go through all tabs in this window we just added to
                var tabs = aDOMWindow.gBrowser.tabContainer.childNodes;
                for (var i = 0; i < tabs.length; i++) {
                    Cu.reportError("DOING tab: " + i);
                    var tabBrowser = tabs[i].linkedBrowser;
                    var win = tabBrowser.contentWindow;
                    loadIntoContentWindowAndItsFrames(win);
                }
                //end - go through all tabs in this window we just added to
            } else {
                //does not have tabContainer
                var win = aDOMWindow.gBrowser.contentWindow;
                loadIntoContentWindowAndItsFrames(win);
            }
        } else {
            //window does not have gBrowser
        }
    },
    unloadFromWindow: function (aDOMWindow, aXULWindow) {
        if (!aDOMWindow) {
            return;
        }
        if (aDOMWindow.gBrowser) {
            aDOMWindow.gBrowser.removeEventListener("DOMContentLoaded", domContentLoadedEventListener, false);
            if (aDOMWindow.gBrowser.tabContainer) {
                //has tabContainer
                //start - go through all tabs in this window we just added to
                var tabs = aDOMWindow.gBrowser.tabContainer.childNodes;
                for (var i = 0; i < tabs.length; i++) {
                    Cu.reportError("DOING tab: " + i);
                    var tabBrowser = tabs[i].linkedBrowser;
                    var win = tabBrowser.contentWindow;
                    unloadFromContentWindowAnditsFrames(win);
                }
                //end - go through all tabs in this window we just added to
            } else {
                //does not have tabContainer
                var win = aDOMWindow.gBrowser.contentWindow;
                unloadFromContentWindowAndItsFrames(win);
            }
        } else {
            //window does not have gBrowser
        }
    }
};
/*end - windowlistener*/

function loadIntoContentWindowAndItsFrames(theWin) {
    // ChromeWindow
    Cu.reportError("theWin " + theWin);
    var frames = theWin.frames;
    var winArr = [theWin];
    for (var j = 0; j < frames.length; j++) {
        winArr.push(frames[j].window);
    }
    Cu.reportError("# of frames in tab: " + frames.length);
    for (var j = 0; j < winArr.length; j++) {
        if (j == 0) {
            // Cu.reportError("**checking win: " + j + " location = " + winArr[j].document.location);
        } else {
            // Cu.reportError("**checking frame win: " + j + " location = " + winArr[j].document.location);
        }
        var doc = winArr[j].document;
        //START - edit below here
        addInjections(doc);
        if (ignoreFrames) {
            break;
        }
        //END - edit above here
    }
}

function unloadFromContentWindowAndItsFrames(theWin) {
    var frames = theWin.frames;
    var winArr = [theWin];
    for (var j = 0; j < frames.length; j++) {
        winArr.push(frames[j].window);
    }
    Cu.reportError("# of frames in tab: " + frames.length);
    for (var j = 0; j < winArr.length; j++) {
        if (j == 0) {
            Cu.reportError("**checking win: " + j + " location = " + winArr[j].document.location);
        } else {
            Cu.reportError("**checking frame win: " + j + " location = " + winArr[j].document.location);
        }
        var doc = winArr[j].document;
        //START - edit below here
        removeInjections(doc);
        if (ignoreFrames) {
            break;
        }
        //END - edit above here
    }
}

function startup(aData, aReason) {
    windowListener.register();
}

function shutdown(aData, aReason) {
    if (aReason == APP_SHUTDOWN) return;
    windowListener.unregister();
}

function install() {
}

function uninstall() {
}

exports.startup = startup;

exports.shutdown = shutdown;
