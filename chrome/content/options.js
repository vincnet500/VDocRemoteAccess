
VRAOptions = {
	
	init: function(mustCenter) {
        var parameters = window.arguments[1];
        document.getElementById("configurationName").value = parameters.configurationName;
        document.getElementById("configurationName").disabled = (window.arguments[0] != "new");
        document.getElementById("serverName").value = parameters.serverURL;
        document.getElementById("login").value = parameters.serverLogin;
        document.getElementById("password").value = parameters.serverPassword;
          
        try {
            // Clean dialog default buttons
            document.documentElement.getButton("accept").setAttribute("style", "display:none;");
            document.documentElement.getButton("cancel").setAttribute("style", "display:none;");
        }
        catch (e) {}
        
        if (mustCenter) {
            var w = (screen.availWidth/2) - (window.innerWidth/2);
            var h = (screen.availHeight/2) - (window.innerHeight/2);
            window.moveTo(w,h);
        }
	},
    
    testConnection: function(serverName, login, password) {
        GenericSystem.showLoading("vra-loading", true);
        var serverName = VRASystem.validateServerName(serverName);
        VRASystem.doSecure(null, serverName, login, password, function(configurationName, serverName, token) {
            if ( (typeof(token) != "undefined") && (token != '') ) {
                GenericSystem.basicAlert(GenericSystem.getTranslation("vra-string-bundle", "connection.success.message"));
            }
        });
        GenericSystem.showLoading("vra-loading", false);
    },
    
    validate: function(configurationName, serverName, login, password) {
        if ( (window.arguments[0] == "new") && (VRAAdvancedOptions.getServerConfiguration(configurationName) != null) ) {
            window.alert(GenericSystem.getTranslation("vra-string-bundle", "options.validate.server.already.exists"));
        }
        else {
            var parameters = window.arguments[1];
            parameters.configurationName = configurationName;
            parameters.serverURL = serverName;
            parameters.serverLogin = login;
            parameters.serverPassword = password;
            
            VRASystem.clearLocalCacheToken(VRASystem.validateServerName(serverName));
            console.error(GenericSystem.getPref("tokens"));
            
            window.close();
        }
    }

}

window.addEventListener("load", function () { VRAOptions.init(true); }, false);