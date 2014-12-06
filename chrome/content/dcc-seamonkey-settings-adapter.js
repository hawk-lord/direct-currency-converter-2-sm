/**
 * Created by per on 14-10-30.
 */

const SettingsAdapter = function() {
//    self.port.on("showSettings", DirectCurrencySettings.showSettings);
    const receiveMessage = function(event) {
        console.error("receiveMessage " + event.data);
        DirectCurrencySettings.showSettings(event.data);
    };
    window.addEventListener("message", receiveMessage, false);
    console.error("SettingsAdapter");
    return {
        save: function (contentScriptParams) {
            self.port.emit("saveSettings", contentScriptParams);
        },
        reset: function () {
            self.port.emit("resetSettings");
        }
    }
}();