
VRAOptions = {
	
	init: function() {
		
	},
    
    testConnection(serverName, login, password) {
        GenericSystem.showLoading("vra-loading", true);
        var serverName = VRASystem.validateServerName(serverName);
        VRASystem.doSecure(serverName, login, password, function(xhr) {
            var jsonResponse = JSON.parse(xhr.responseText);
            try {
                var token = jsonResponse.authenticate.body.token["@key"];
                if ( (typeof(token) != "undefined") && (token != '') ) {
                    GenericSystem.basicAlert(GenericSystem.getTranslation("vra-string-bundle", "connection.success.message"));
                }
            }
            catch (e) {
                GenericSystem.basicAlert(GenericSystem.getTranslation("vra-string-bundle", "connection.error.message"));
            }
        });
        GenericSystem.showLoading("vra-loading", false);
    }

}

window.addEventListener("load", function () { VRAOptions.init(); }, false);