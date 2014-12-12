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
                console.error("Promise fulfilled aDirectCurrencySettings " + aDirectCurrencySettings + " aData " +  aData);
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
        console.error("SettingsAdapter receiveMessage " + event.data
            + " conversionQuotes " + event.data.conversionQuotes);
        // DirectCurrencySettings.showSettings(event.data)
        if (event.data.conversionQuotes !== undefined)
            showSettings(event.data);
    };
    window.addEventListener("message", receiveMessage, false);
    // Send message when created
    // otherWindow.postMessage("SettingsAdapter created", "*");
    console.error("SettingsAdapter created");
    return {
        save: function (contentScriptParams) {
            window.postMessage(contentScriptParams, "*");
        },
        reset: function () {
            self.postMessage(contentScriptParams, "*");
        }
    }
}();