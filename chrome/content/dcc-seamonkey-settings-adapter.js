/**
 * Created by per on 14-10-30.
 */

const SettingsAdapter = function() {
//    self.port.on("showSettings", DirectCurrencySettings.showSettings);
    const showSettings = function(aData) {
        var promise = new Promise(
            function(resolve, reject) {
                if (DirectCurrencySettings)
                    resolve(DirectCurrencySettings);
                else
                    reject("NOK");
            }
        );
        promise.then(
            function(aDirectCurrencySettings) {
                // console.error("Promise fulfilled aDirectCurrencySettings " + aDirectCurrencySettings + " aData " +  aData);
                aDirectCurrencySettings.showSettings(aData)
            },
            function (err) {
                console.error("then "  + err);
            }
        ).catch(
            function (err) {
                console.error("catch " + err);
            }
        );
    };
    const receiveMessage = function(event) {
        // console.error("SettingsAdapter receiveMessage " + event.data
        //    + " conversionQuotes " + event.data.conversionQuotes);
        // DirectCurrencySettings.showSettings(event.data)
        if (event.data.conversionQuotes !== undefined)
            showSettings(event.data);
    };
    window.addEventListener("message", receiveMessage, false);
    // Send message when created
    // otherWindow.postMessage("SettingsAdapter created", "*");
    // console.error("SettingsAdapter created");
    return {
        save: function (contentScriptParams) {
            var element = document.createElement("DccSaveSettingsDataElement");
            element.setAttribute("command", "save-dcc");
            element.setAttribute("settings", JSON.stringify(contentScriptParams));
            document.documentElement.appendChild(element);
            var evt = document.createEvent("Events");
            evt.initEvent("DccSaveSettingsEvent", true, false);
            element.dispatchEvent(evt);
        },
        reset: function () {
            var element = document.createElement("DccResetSettingsDataElement");
            element.setAttribute("command", "reset-dcc");
            document.documentElement.appendChild(element);
            var evt = document.createEvent("Events");
            evt.initEvent("DccResetSettingsEvent", true, false);
            element.dispatchEvent(evt);
        }
    }
}();