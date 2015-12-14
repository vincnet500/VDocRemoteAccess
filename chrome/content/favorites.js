
VRAFavorites = {
	
	init: function() {
        try {
            // Clean dialog default buttons
            document.documentElement.getButton("accept").setAttribute("style", "display:block;");
            document.documentElement.getButton("cancel").setAttribute("style", "display:block;");
        }
        catch (e) {}
        
        GenericSystem.showLoading('vra-loading', true);
        var allWorkflows = [];
        var localWorkflowPopup = null;
        
        var indexServer = 0;
        var allSC = VRAAdvancedOptions.getAllServerConfigurations();
        for (var key in allSC.servers) {
            var serverConfiguration = allSC.servers[key];
            var serverName = VRASystem.validateServerName(serverConfiguration.serverURL);
            VRASystem.doSecure(serverConfiguration.configurationName, serverName, serverConfiguration.serverLogin, serverConfiguration.serverPassword, false, function(configurationName, serverName, token) {
                var xw = new XMLWriter('UTF-8');
                xw.writeStartDocument();
                xw.writeStartElement("view");
                xw.writeEndDocument();
                xw.writeAttributeString("xmlns:vw1", "http://www.axemble.com/process/view");
                xw.writeStartElement("header");
                xw.writeAttributeString("name", "WORKFLOWS");
                xw.writeEndElement();
                xw.writeEndElement();

                VRASystem.initCommonList(serverName, "defaultWorkflowName", token, "workflow", "cmd", xw, "view/body/workflow", (indexServer == allSC.servers.length - 1), function(popup, elem)  {
                    localWorkflowPopup = popup;
                    allWorkflows.push(elem);
                }, function(serverName) {
                    if (indexServer == allSC.servers.length - 1) {
                        allWorkflows.sort(function(a, b) {
                            if (a.getElementsByTagName("header")[0].getAttribute("name").toLowerCase() <= b.getElementsByTagName("header")[0].getAttribute("name").toLowerCase())
                                return -1;
                            if ( a.getElementsByTagName("header")[0].getAttribute("name").toLowerCase() >= b.getElementsByTagName("header")[0].getAttribute("name").toLowerCase() )
                                return 1;
                            return 0;
                        });
                        for (var key in allWorkflows) {
                            var workflowStatus = allWorkflows[key].getElementsByTagName("header")[0].getAttribute("status");
                            var onlyProductionWorkflows = GenericSystem.getBoolPref("workflowStatusProductionOnly");
                            if ( (workflowStatus == null) || (typeof(workflowStatus) == "undefined") || (onlyProductionWorkflows && workflowStatus == 3) || (!onlyProductionWorkflows && workflowStatus < 4) ) {
                    localWorkflowPopup.appendChild(GenericSystem.createMenuItem(VRASystem.getWorkflowEntryName(allWorkflows[key].getElementsByTagName("header")[0]), VRASystem.getWorkflowEntryLabel(allWorkflows[key].getElementsByTagName("header")[0])));
                            }
                        }
                        localWorkflowPopup.parentNode.value = GenericSystem.getPref("defaultWorkflowName");
                        GenericSystem.showLoading('vra-loading', false);
                    }
                    indexServer++;
                });
            }, function() {});
        }
	}

}

window.addEventListener("load", function () { VRAFavorites.init(); }, false);