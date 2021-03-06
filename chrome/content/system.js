
GenericSystem = {
	
	init: function() {
		
	},
    
    appendListBox : function(listname, className, internalValue, values) {
        const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
        var listBox = document.getElementById(listname);
        if (listBox != null) {
            var listItem = document.createElementNS(XUL_NS, "listitem");
            listItem.setAttribute("uri", internalValue);
            for (var key in values) {
                var listCell = document.createElementNS(XUL_NS, "listcell");
                listCell.setAttribute("label", values[key]);
                if (className != '') {
                    listCell.setAttribute("class", className);
                }
                listItem.appendChild(listCell);
            }
            listBox.appendChild(listItem);
        }
    },
    
    cleanListBox : function(listname) {
        var listBox = document.getElementById(listname);
        if (listBox != null) {
            var allChildNodes = listBox.childNodes;
            var allChildNodesLength = allChildNodes.length;
            var headNode = listBox.firstChild;
            while (listBox.firstChild) {
                listBox.removeChild(listBox.firstChild);
            }
            listBox.appendChild(headNode);
        }
    },
	
	createMenuItem: function(aKey, aLabel) {
		const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		var item = document.createElementNS(XUL_NS, "menuitem"); // create a new XUL menuitem
		item.setAttribute("value", aKey);
		item.setAttribute("label", aLabel);
		return item;
	},
	
	getMainWindow : function() {
		var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
		var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
		return windowManagerInterface.getMostRecentWindow("navigator:browser");
	},
	
	getWindow : function(index) {
		var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
		var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
		var eb = windowManagerInterface.getEnumerator("navigator:browser");
		if (eb.hasMoreElements()) {
			var it;
			var i = 0;
			while (eb.hasMoreElements()) {
				it = eb.getNext();
				if (i == index) {
					return it.QueryInterface(Components.interfaces.nsIDOMWindow);
				}
				i++;
			}
		}
	},
	
	getBrowser : function() {
		return this.getMainWindow().getBrowser();
	},
	
	getCurrentBrowserUrl : function() {
		return this.getMainWindow().getBrowser().selectedBrowser.contentWindow.location.href;
	},
	
	getScreenshot : function(idCanvas) {
		var mainWindow = this.getMainWindow();
		var mainWindowDocument = mainWindow.getBrowser().selectedBrowser.contentWindow.document.documentElement;
		var width = mainWindowDocument.clientWidth;
		var height = mainWindowDocument.clientHeight;
		var cnvs = document.getElementById(idCanvas);
        cnvs.width = width;
		cnvs.height = height;
		var ctx = cnvs.getContext("2d");
		ctx.drawWindow(mainWindow.content, 0, 0, mainWindow.innerWidth, mainWindow.innerHeight, "rgb(255,255,255)");
		return(cnvs.toDataURL("image/png"));
	},
	
	b64toBlob : function(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, {type: contentType});
    },
	
	getMenuPopupValue : function(name) {
		var menuPopup = document.getElementById(name);
		for (var childKey in menuPopup.children) {
			var child = menuPopup.children[childKey];
			if (child.getAttribute) {
				if (child.getAttribute("selected"))	{
					return child.getAttribute("value");
				}
			}
		}
		return "";
	},
	
	getTextBoxValue : function(name) {
		return document.getElementById(name).value;
	},
	
	getCheckBoxValue : function(name) {
		var checkbox = document.getElementById(name);
		return (Boolean(checkbox.getAttribute("checked")));
	},
	
	getPref : function(pref) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.vdocremoteaccess@vincnet500.com.");
        try {
            return branch.getCharPref(pref);
        }
        catch (e) {}
        return "";
	},
    
    setPref : function(pref, value) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.vdocremoteaccess@vincnet500.com.");
        try {
            branch.setCharPref(pref, value);
        }
        catch (e) {}
	},
    
    getBoolPref : function(pref) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.vdocremoteaccess@vincnet500.com.");
        try {
            return branch.getBoolPref(pref);
        }
        catch (e) {}
        return "";
	},
    
    setBoolPref : function(pref, value) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.vdocremoteaccess@vincnet500.com.");
        try {
            branch.setBoolPref(pref, value);
        }
        catch (e) {}
	},
    
    basicAlert: function(message) {
        var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
              .getService(Components.interfaces.nsIPromptService);
        prompts.alert(window, "VDoc Remote Access", message);
    },
	
	showAlert: function(title, message) {
		var alertService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
		alertService.showAlertNotification(
			'chrome://vdocremoteaccess/skin/icon_32x32.png',
			title, message, false, '', null, ''
		);
	},
    
    showLoading: function(divID, show) {
        if (show) {
            document.getElementById(divID).style.display = 'block';
        }
        else {
            document.getElementById(divID).style.display = 'none';   
        }
    },
	
	getTranslation: function(bundle, key) {
		var stringsBundle = document.getElementById(bundle);
		return stringsBundle.getString(key);
	},
    
    getCurrentShortLocale : function() {
        var chromeREgistryService = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
            .getService(Components.interfaces.nsIXULChromeRegistry);
        var language = chromeREgistryService.getSelectedLocale("global");
        if (language.indexOf("-") > -1) {
            language = language.substring(0, language.indexOf("-"));
        }
        return language;
    },
    
    openInANewTab : function(link) {
        var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
            .getService(Components.interfaces.nsIWindowMediator)
            .getMostRecentWindow('navigator:browser');
        win.openUILinkIn(link, 'tab');   
    },
    
    addURLParameter : function(baseURL, parameterToAdd) {
        var concatChar = "&";
        if (baseURL.indexOf('?') == -1) {
            concatChar = '?';   
        }
        return baseURL + concatChar + parameterToAdd;
    }
	
}

window.addEventListener("load", function () { GenericSystem.init(); }, false);