
VRASystem = {
	
	init: function() {
		
	},
	
	initCommonList: function(listName, path, rootIterator, offset, eraseExistingValues, callback, endcallback) {
		//TODO
	},
    
    validateServerName : function(serverName) {
        if (serverName.indexOf("/", serverName.length - 1) == -1) {
            serverName += '/';
        }
        return serverName;
    },
    
    doSecure : function(serverName, login, password, callback) {
        if (serverName == '') {
            serverName = GenericSystem.getPref("serverName");
        }
        if (login == '') {
            login = GenericSystem.getPref("login");
        }
        if (password == '') {
            password = GenericSystem.getPref("password");
        }
        
        try {
            var root = new Object();
		    root.authenticate = new Object();
            root.authenticate.header = new Object();
            root.authenticate.header.login = login;
            root.authenticate.header.password = password;
            root.authenticate.header.timeout = 30;
            
            var xhr = new XMLHttpRequest();
            xhr.open("POST", serverName + "navigation/flow?module=portal&cmd=authenticate&flowmode=json", true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    callback(xhr);
                }
            }
            xhr.send(JSON.stringify(root));
        }
        catch (e) {
            GenericSystem.basicAlert(GenericSystem.getTranslation("vra-string-bundle", "connection.error.message"));
        }
    }
	
}

window.addEventListener("load", function () { VRASystem.init(); }, false);