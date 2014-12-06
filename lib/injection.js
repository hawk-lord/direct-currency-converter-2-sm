/**
 * https://gist.github.com/Noitidart/9406437#file-bootstrap-js
 */
const { Cc, Ci, Cu } = require('chrome');
//const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const self = {
    id: 'Bootstrap-Watch-Host-Event-Listener-Inject-Files',
    suffix: '@jetpack',
    path: 'chrome://bootstrap-watch-host-event-listener-inject-files/content/',
    aData: 0,
};
const ignoreFrames = true;
const hostPattern = 'bing.com'; //if a page load matches this host it will inject into it

Cu.import('resource://gre/modules/Services.jsm');


function addInjections(theDoc) {
    // SM navigator FF browser
    Cu.reportError('addInjections host = ' + theDoc.location.host);
    if (!theDoc) {
        Cu.reportError('no doc!');
        return;
    } //document not provided, it is undefined likely
/*
    if (!(theDoc.location && theDoc.location.host.indexOf(hostPattern) > -1)) {
        Cu.reportError('location not match host:' + theDoc.location.host);
        return;
    }
*/
    //if (!theDoc instanceof Ci.nsIDOMHTMLDocument) { Cu.reportError('not html doc'); return; } //not html document, so its likely an xul document //you probably dont need this check, checking host is enought
    Cu.reportError('host pass');

    removeInjections(theDoc, true); //remove my div if it was already there, this is just a precaution

/*
    //add your stuff here
    var myIFrame = theDoc.createElement('iframe');
    myIFrame.setAttribute('id', 'injected-iframe');
    myIFrame.setAttribute('type', 'content');
    //myIFrame.setAttribute('accessibleType','100A');
    myIFrame.setAttribute('src', self.path + '_inject-website.htm');


    var myScript = theDoc.createElement('script');
    myScript.setAttribute('src', self.path + '_inject-script.js');
    myScript.setAttribute('id', 'injected-script');

    var myImage = theDoc.createElement('img');
    myImage.setAttribute('src', self.path + '_inject-image.png');
    myImage.setAttribute('id', 'injected-image');

    theDoc.documentElement.appendChild(myIFrame);
    theDoc.documentElement.appendChild(myScript);
    theDoc.documentElement.appendChild(myImage);
*/
    // Cu.reportError("theDoc " + theDoc);
    if (!theDoc.getElementById("jquery")) {
        var jquery = theDoc.createElement("script");
        jquery.setAttribute("src", "chrome://direct-currency-converter/content/jquery-2.1.1.min.js");
        jquery.setAttribute("id", "jquery");
        theDoc.head.insertBefore(jquery, null);
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

    Cu.reportError("settingsAdapter " + settingsAdapter);
}

function removeInjections(theDoc, skipChecks) {
    //Cu.reportError('removeInjections');
    if (!skipChecks) {
        if (!theDoc) {
            Cu.reportError('no doc!');
            return;
        } //document not provided, it is undefined likely
        if (!(theDoc.location && theDoc.location.host.indexOf(hostPattern) > -1)) {
            Cu.reportError('location not match host:' + theDoc.location.host);
            return;
        }
        //if (!theDoc instanceof Ci.nsIDOMHTMLDocument) { Cu.reportError('not html doc'); return; } //not html document, so its likely an xul document //you probably dont need this check, checking host is enought
    }

    var myScript = theDoc.getElementById('injected-script'); //test if myDiv is in the page
    if (myScript) {
        var alreadyThere = true;
    }
    if (alreadyThere) {
        //my stuff was found in the document so remove it
        var myIFrame = theDoc.getElementById('injected-iframe');
        var myImage = theDoc.getElementById('injected-image');

        myScript.parentNode.removeChild(myScript);
        myIFrame.parentNode.removeChild(myIFrame);
        myImage.parentNode.removeChild(myImage);
    } else {
        //else its not there so no need to do anything
    }
}

function listenPageLoad(event) {
    var win = event.originalTarget.defaultView;
    var doc = win.document;
    Cu.reportError('page loaded loc = ' + doc.location);
    if (win.frameElement) {
        //its a frame
        Cu.reportError('its a frame');
        if (ignoreFrames) {
            return;//dont want to watch frames
        }
    }
    addInjections(doc);
}

/*start - windowlistener*/
var windowListener = {
    //DO NOT EDIT HERE
    onOpenWindow: function (aXULWindow) {
        // Wait for the window to finish loading
        let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
        aDOMWindow.addEventListener("load", function () {
            aDOMWindow.removeEventListener("load", arguments.callee, false);
            windowListener.loadIntoWindow(aDOMWindow, aXULWindow);
        }, false);
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
        //Stop listening so future added windows dont get this attached
        Services.wm.removeListener(windowListener);
    },
    //END - DO NOT EDIT HERE
    loadIntoWindow: function (aDOMWindow, aXULWindow) {
        if (!aDOMWindow) {
            return;
        }
        if (aDOMWindow.gBrowser) {
            aDOMWindow.gBrowser.addEventListener('DOMContentLoaded', listenPageLoad, false);
            if (aDOMWindow.gBrowser.tabContainer) {
                //has tabContainer
                //start - go through all tabs in this window we just added to
                var tabs = aDOMWindow.gBrowser.tabContainer.childNodes;
                for (var i = 0; i < tabs.length; i++) {
                    Cu.reportError('DOING tab: ' + i);
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
            aDOMWindow.gBrowser.removeEventListener('DOMContentLoaded', listenPageLoad, false);
            if (aDOMWindow.gBrowser.tabContainer) {
                //has tabContainer
                //start - go through all tabs in this window we just added to
                var tabs = aDOMWindow.gBrowser.tabContainer.childNodes;
                for (var i = 0; i < tabs.length; i++) {
                    Cu.reportError('DOING tab: ' + i);
                    var tabBrowser = tabs[i].linkedBrowser;
                    var win = tabBrowser.contentWindow;
                    unloadFromContentWindowAndItsFrames(win);
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
    Cu.reportError('# of frames in tab: ' + frames.length);
    for (var j = 0; j < winArr.length; j++) {
        if (j == 0) {
            Cu.reportError('**checking win: ' + j + ' location = ' + winArr[j].document.location);
        } else {
            Cu.reportError('**checking frame win: ' + j + ' location = ' + winArr[j].document.location);
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
    Cu.reportError('# of frames in tab: ' + frames.length);
    for (var j = 0; j < winArr.length; j++) {
        if (j == 0) {
            Cu.reportError('**checking win: ' + j + ' location = ' + winArr[j].document.location);
        } else {
            Cu.reportError('**checking frame win: ' + j + ' location = ' + winArr[j].document.location);
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

exports.loadIntoContentWindowAndItsFrames = loadIntoContentWindowAndItsFrames;