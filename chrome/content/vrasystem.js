
VRASystem = {
	
	init: function() {
		
	},
	
	initCommonList: function(serverName, listName, token, module, cmd, xmlObject, resultPath, eraseExistingValues, callback, endCallback) {
		var popup = document.getElementById(listName);
        if (eraseExistingValues) {
            popup.innerHTML = '';
            popup.parentNode.value = '';
        }
        var xhr = new XMLHttpRequest();
		xhr.open("POST", serverName + "navigation/flow?module=" + module + "&cmd=" + cmd + "&killsession=false&_AuthenticationKey=" + token, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					var parser = new DOMParser();
                    var xmlDoc = parser.parseFromString(xhr.responseText, "application/xml");
                    var itNote = xmlDoc;
                    var resultPathTab = resultPath.split('/');
                    for (var key in resultPathTab) {
                        var itNote = itNote.getElementsByTagName(resultPathTab[key]);
                        if (key < resultPathTab.length - 1) {
                            itNote = itNote[0];   
                        }
                    }
                    for (var key = 0; key < itNote.length; key++) {
                        callback(popup, itNote[key]);
                    }
                    endCallback(serverName);
				}
			}
		}
		xhr.send(xmlObject.flush());
	},
    
    validateServerName : function(serverName) {
        if (serverName.indexOf("/", serverName.length - 1) == -1) {
            serverName += '/';
        }
        return serverName;
    },
    
    doSecure : function(configurationName, serverName, login, password, showError, callback, errorCallback) {
        serverName = VRASystem.validateServerName(serverName);
        var cachedToken = this.getLocalCacheToken(serverName);
        if ( (cachedToken != null) && (cachedToken != '') ) {
            callback(configurationName, serverName, cachedToken);
        }
        else {
            try {
                var root = new Object();
                root.authenticate = new Object();
                root.authenticate.header = new Object();
                root.authenticate.header.login = login;
                root.authenticate.header.password = password;
                root.authenticate.header.timeout = 300;

                var xhr = new XMLHttpRequest();
                xhr.open("POST", serverName + "navigation/flow?module=portal&cmd=authenticate&killsession=false&flowmode=json", true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        var jsonResponse = JSON.parse(xhr.responseText);
                        var token = jsonResponse.authenticate.body.token["@key"];
                        VRASystem.setLocalCacheToken(serverName, token);
                        callback(configurationName, serverName, token);
                    }
                }
                xhr.send(JSON.stringify(root));
            }
            catch (e) {
                if (showError) {
                    GenericSystem.basicAlert(GenericSystem.getTranslation("vra-string-bundle", "connection.error.message"));
                }
                errorCallback();
            }
        }
    },
    
    getLocalCacheToken : function(serverName) {
        var tokensString = GenericSystem.getPref("tokens");
        if ( (tokensString == null) || (typeof(tokensString) == "undefined") || tokensString == '' ) {
            tokensString = "{\"tokenslist\":{}}";
        }
        var tokens = JSON.parse(tokensString);
        var serverToken = tokens.tokenslist[serverName];
        if ( (serverToken != null) && (typeof(tokens) != "undefined") && tokens != '' ) {
            return tokens.tokenslist[serverName];
        }
        return null;
    },
    
    setLocalCacheToken : function(serverName, token) {
        var tokensString = GenericSystem.getPref("tokens");
        if ( (tokensString == null) || (typeof(tokensString) == "undefined") || tokensString == '' ) {
            tokensString = "{\"tokenslist\":{}}";
        }
        var tokens = JSON.parse(tokensString);
        tokens.tokenslist[serverName] = token;
        GenericSystem.setPref("tokens", JSON.stringify(tokens));
    },
    
    clearLocalCacheToken : function(serverName) {
        this.setLocalCacheToken(serverName, "");
    },
    
    getWorkflowEntryLabel : function(workflowEntry) {
        var workflowStatus = workflowEntry.getAttribute("status");
        if ( (workflowStatus == null) || (typeof(workflowStatus) == "undefined") ) {
            return workflowEntry.getAttribute("name");
        }
        else {
            return workflowEntry.getAttribute("label");
        }
    },
    
    getWorkflowEntryName : function(workflowEntry) {
        var workflowStatus = workflowEntry.getAttribute("status");
        if ( (workflowStatus == null) || (typeof(workflowStatus) == "undefined") ) {
            return workflowEntry.getAttribute("protocol-uri");
        }
        else {
            return workflowEntry.getAttribute("name");
        }
    }
	
}

window.addEventListener("load", function () { VRASystem.init(); }, false);