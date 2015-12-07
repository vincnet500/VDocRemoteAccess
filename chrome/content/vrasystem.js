
VRASystem = {
	
	init: function() {
		
	},
	
	initCommonList: function(listName, token, module, cmd, xmlObject, resultPath, eraseExistingValues, callback, endCallback) {
		var popup = document.getElementById(listName);
        if (eraseExistingValues) {
            popup.innerHTML = '';
            popup.parentNode.value = '';
        }
        var serverName = VRASystem.validateServerName(GenericSystem.getPref("serverName"));
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
                    endCallback();
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
    
    doSecure : function(serverName, login, password, callback) {
        if (serverName == '') {
            serverName = GenericSystem.getPref("serverName");
        }
        serverName = VRASystem.validateServerName(serverName);
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
            xhr.open("POST", serverName + "navigation/flow?module=portal&cmd=authenticate&killsession=false&flowmode=json", true);
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
    },
    
    getWorkflowEntryLabel : function(workflowEntry) {
        var workflowStatus = workflowEntry.getAttribute("status");
        if ( (workflowStatus == null) || (typeof(workflowStatus) == "undefined") || (workflowStatus < 4) ) {
            return workflowEntry.getAttribute("name");
        }
        else {
            return workflowEntry.getAttribute("label");
        }
    },
    
    getWorkflowEntryName : function(workflowEntry) {
        var workflowStatus = workflowEntry.getAttribute("status");
        if ( (workflowStatus == null) || (typeof(workflowStatus) == "undefined") || (workflowStatus < 4) ) {
            return workflowEntry.getAttribute("protocol-uri");
        }
        else {
            return workflowEntry.getAttribute("name");
        }
    }
	
}

window.addEventListener("load", function () { VRASystem.init(); }, false);