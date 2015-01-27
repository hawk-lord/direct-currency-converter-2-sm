/*
 * © 2014 Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Based on code from Simple Currency Converter
 * https://addons.mozilla.org/en-US/firefox/addon/simple-currency-converter/
 *
 * Module pattern is used.
 */
const ContentAdapter = function() {
    //self.port.on("sendEnabledStatus", DirectCurrencyContent.onSendEnabledStatus);
    //self.port.on("updateSettings", DirectCurrencyContent.onUpdateSettings);
    const onSendEnabledStatus = function(aData) {
        const sendEnabledStatusPromise = new Promise(
            function(resolve, reject) {
                if (DirectCurrencyContent)
                    resolve(DirectCurrencyContent);
                else
                    reject(Error("sendEnabledStatusPromise NOK"));
            }
        );
        sendEnabledStatusPromise.then(
            function(aDirectCurrencyContent) {
                // console.error("Promise fulfilled aDirectCurrencyContent " + aDirectCurrencyContent + " aData " +  aData);
                aDirectCurrencyContent.onSendEnabledStatus(aData)
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
    const onUpdateSettings = function(aData) {
        const updateSettingsPromise = new Promise(
            function(resolve, reject) {
                if (DirectCurrencyContent)
                    resolve(DirectCurrencyContent);
                else
                    reject(Error("updateSettingsPromise NOK"));
            }
        );
        updateSettingsPromise.then(
            function(aDirectCurrencyContent) {
                // console.error("Promise fulfilled aDirectCurrencyContent " + aDirectCurrencyContent + " aData " +  aData);
                aDirectCurrencyContent.onUpdateSettings(aData)
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
        // console.error("ContentAdapter receiveMessage " + event.data
        //    + " conversionQuotes " + event.data.conversionQuotes);
        // DirectCurrencySettings.showSettings(event.data)
        if (event.data.conversionQuotes !== undefined) {
            onSendEnabledStatus(event.data);
            onUpdateSettings(event.data);
        }
    };
    window.addEventListener("message", receiveMessage, false);
    // Send message when created
    // otherWindow.postMessage("SettingsAdapter created", "*");
    // console.error("ContentAdapter created");
    return {
        finish: function (hasConvertedElements) {
            // FIXME
            // self.port.emit("finishedTabProcessing", hasConvertedElements);
        }
    }
}();