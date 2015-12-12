
VRAAdvancedOptions = {
	
	init: function(mustCenter) {
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
        
        this.refreshServerViews();
        
        var listBox = document.getElementById("shortDataTable");
        if (listBox != null) {
            listBox.addEventListener("dblclick", function(event) {
                var target = event.target;
                while (target && target.localName != "listitem") {
                    target = target.parentNode;
                }
                if (!target) {
                    return;
                }

                var configurationName = target.getAttribute("uri");
                var configJSON = VRAAdvancedOptions.getServerConfiguration(configurationName);
                openDialog("chrome://vdocremoteaccess/content/options.xul", "dlg", "modal,chrome,centerscreen", "edit", configJSON);
                VRAAdvancedOptions.updateServer(configurationName, configJSON);
            }, false);
        }
	},
    
    addNewServer : function() {
        var parameters = new Object();
        parameters.configurationName = GenericSystem.getTranslation("vra-string-bundle", "advancedoptions.new.server.configuration.name");
        parameters.serverURL = "";
        parameters.serverLogin = "";
        parameters.serverPassword = "";
        openDialog("chrome://vdocremoteaccess/content/options.xul", "dlg", "modal,chrome,centerscreen", "new", parameters);
        
        var s = this.getAllServerConfigurations();
        s.servers.push(parameters);
        GenericSystem.setPref("servers", JSON.stringify(s));
        
        this.refreshServerViews();
    },
    
    updateServer : function(configurationName, parameters) {
        var s = this.getAllServerConfigurations();
        for (var key in s.servers) {
            var server = s.servers[key];
            if (server["configurationName"] == configurationName) {
                server.serverURL = parameters.serverURL;
                server.serverLogin = parameters.serverLogin;
                server.serverPassword = parameters.serverPassword;
            }
        }
        GenericSystem.setPref("servers", JSON.stringify(s));
        this.refreshServerViews();
    },
    
    refreshServerViews : function() {
        GenericSystem.cleanListBox("shortDataTable");
        var s = this.getAllServerConfigurations();
        for (var key in s.servers) {
            var server = s.servers[key];
            GenericSystem.appendListBox("shortDataTable", "", server["configurationName"], [server["configurationName"], server["serverURL"]]);
        }
    },
    
    getAllServerConfigurations : function() {
        var servers = GenericSystem.getPref("servers");
        if ( (servers == null) || (typeof(servers) == "undefined") || servers == '' )
        {
            servers = "{\"servers\":[]}";
        }
        return JSON.parse(servers);
    },
    
    getServerConfiguration : function(configurationName) {
        var s = this.getAllServerConfigurations();
        for (var key in s.servers) {
            var server = s.servers[key];
            if (server["configurationName"] == configurationName) {
                return server;
            }
        }
        return null;
    },
    
    removeServer : function() {
        var listBox = document.getElementById("shortDataTable");
        var item = listBox.selectedItem;
        if (item != null ) {
            if (window.confirm(GenericSystem.getTranslation("vra-string-bundle", "advancedoptions.remove.server.confirm.message"))) { 
                var configurationName = item.getAttribute("uri");
                var s = this.getAllServerConfigurations();
                var indexItemToDelete = 0;
                for (var key in s.servers) {
                    var server = s.servers[key];
                    if (server["configurationName"] == configurationName) {
                        break;
                    }
                    indexItemToDelete++;
                }
                s.servers.splice(indexItemToDelete, 1);

                GenericSystem.setPref("servers", JSON.stringify(s));
                this.refreshServerViews();
            }
        }
    },
    
    validate : function() {
        GenericSystem.setBoolPref("workflowStatusProductionOnly", GenericSystem.getCheckBoxValue("workflowStatusProductionOnly"));
        window.close();
    }

}

window.addEventListener("load", function () { VRAAdvancedOptions.init(true); }, false);