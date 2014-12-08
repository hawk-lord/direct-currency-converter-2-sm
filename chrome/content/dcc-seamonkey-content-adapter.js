/**
 * Created by per on 14-10-30.
 */

const ContentAdapter = function() {
    //self.port.on("sendEnabledStatus", DirectCurrencyContent.onSendEnabledStatus);
    //self.port.on("updateSettings", DirectCurrencyContent.onUpdateSettings);
    const onSendEnabledStatus = function(aData) {
        var promise = new Promise(
            function(resolve, reject) {
                if (DirectCurrencyContent)
                    resolve(DirectCurrencyContent);
                else
                    reject("NOK");
            }
        );
        promise.then(
            function(dcs) {
                console.error("Promise fulfilled dcs " + dcs + " aData " +  aData);
                dcs.onSendEnabledStatus(aData)
            },
            function (err) {
                console.error("then "  + err);
            }
        );
        promise.catch(
            function (err) {
                console.error("catch " + err);
            }
        );
    };
    const onUpdateSettings = function(aData) {
        var promise = new Promise(
            function(resolve, reject) {
                if (DirectCurrencyContent)
                    resolve(DirectCurrencyContent);
                else
                    reject("NOK");
            }
        );
        promise.then(
            function(dcs) {
                console.error("Promise fulfilled dcs " + dcs + " aData " +  aData);
                dcs.onUpdateSettings(aData)
            },
            function (err) {
                console.error("then "  + err);
            }
        );
        promise.catch(
            function (err) {
                console.error("catch " + err);
            }
        );
    };
    const receiveMessage = function(event) {
        console.error("ContentAdapter receiveMessage " + event.data
        + " conversionQuotes " + event.data.conversionQuotes);
        // DirectCurrencySettings.showSettings(event.data)
        if (event.data.conversionQuotes !== undefined) {
            onSendEnabledStatus(event.data);
            onUpdateSettings(event.data);
        }
    };
    window.addEventListener("message", receiveMessage, false);
    // Send message when created
    // otherWindow.postMessage("SettingsAdapter created", "*");
    console.error("ContentAdapter created");
    return {
        finish: function (hasConvertedElements) {
            // FIXME
            // self.port.emit("finishedTabProcessing", hasConvertedElements);
        }
    }
}();