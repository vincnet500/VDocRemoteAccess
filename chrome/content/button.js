
VRAButton = {
	
	init: function () {
        GenericSystem.setPref("tokens", "");
		this.addButton();
	},
	
	addButton: function () {
		toolbarButton = 'vra-button';
		navBar = document.getElementById('nav-bar');
		currentSet = navBar.getAttribute('currentset');
		if (!currentSet) {
			currentSet = navBar.currentSet;
		}
		curSet = currentSet.split(',');
		if (curSet.indexOf(toolbarButton) == -1) {
			set = curSet.concat(toolbarButton);
			navBar.setAttribute("currentset", set.join(','));
			navBar.currentSet = set.join(',');
			document.persist(navBar.id, 'currentset');
			try {
				BrowserToolboxCustomizeDone(true);
			} catch (e) {}
		}
	},
    
    loadDirectAccesses : function() {
        var allSC = VRAAdvancedOptions.getAllServerConfigurations();
        
        var directAccessMenuItem = document.getElementById("vra-context-direct-access-menu");
        directAccessMenuItem.innerHTML = '';
        directAccessMenuItem.parentNode.value = '';
        
        for (var key in allSC.servers) {
            var serverConfiguration = allSC.servers[key];
            
            var serverName = VRASystem.validateServerName(serverConfiguration.serverURL);
            VRASystem.doSecure(serverConfiguration.configurationName, serverName, serverConfiguration.serverLogin, serverConfiguration.serverPassword, false, function(configurationName, serverName, token) {
                var localServerConfiguration = VRAAdvancedOptions.getServerConfiguration(configurationName);
                directAccessMenuItem.appendChild(GenericSystem.createMenuItem(GenericSystem.addURLParameter(localServerConfiguration.serverURL, "_AuthenticationKey=" + token), localServerConfiguration.configurationName));
            }, function() {});
        }
    },
	
    loadWorkflows : function() {
        var allSC = VRAAdvancedOptions.getAllServerConfigurations();
        var allWorkflowEntries = [];
        var indexServer = 0;
        var errorState = false;
        for (var key in allSC.servers) {
            var serverConfiguration = allSC.servers[key];
            
            var xw = new XMLWriter('UTF-8');
            xw.writeStartDocument();
            xw.writeStartElement("view");
            xw.writeEndDocument();
            xw.writeAttributeString("xmlns:vw1", "http://www.axemble.com/process/view");
            xw.writeStartElement("header");
            xw.writeAttributeString("name", "WORKFLOWS");
            xw.writeEndElement();
            xw.writeEndElement();

            var xmlString = xw.flush();
            var serverName = VRASystem.validateServerName(serverConfiguration.serverURL);
            VRASystem.doSecure(serverConfiguration.configurationName, serverName, serverConfiguration.serverLogin, serverConfiguration.serverPassword, false, function(configurationName, serverName, token) {
                var xhr = new XMLHttpRequest();
                xhr.open("POST", serverName + "navigation/flow?module=workflow&cmd=cmd&killsession=false&_AuthenticationKey=" + token, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(xhr.responseText, "application/xml");
                        var workflowsArray = xmlDoc.getElementsByTagName("view")[0].getElementsByTagName("body")[0].getElementsByTagName("workflow");
                        for (var key in workflowsArray)
                        {
                            var workflowElement = workflowsArray[key];
                            try {
                                var workflowHeader = workflowElement.getElementsByTagName("header")[0];
                                workflowHeader.setAttribute("serverName", serverName);
                                workflowHeader.setAttribute("token", token);
                                allWorkflowEntries.push(workflowHeader);
                            }
                            catch(e) {}
                        }

                        if (indexServer == allSC.servers.length - 1) {
                            var newDocumentMenuItem = document.getElementById("vra-context-new-document-menu");
                            newDocumentMenuItem.innerHTML = '';
                            newDocumentMenuItem.parentNode.value = '';

                            allWorkflowEntries.sort(function(a, b) {
                                if (a.getAttribute("name").toLowerCase() < b.getAttribute("name").toLowerCase())
                                    return -1;
                                if (a.getAttribute("name").toLowerCase() > b.getAttribute("name").toLowerCase() )
                                    return 1;
                                return 0;
                            });

                            for (var key in allWorkflowEntries) {
                                // Handle status if we have it in flow result
                                var workflowStatus = allWorkflowEntries[key].getAttribute("status");
                                var localServerName = allWorkflowEntries[key].getAttribute("serverName");
                                var localToken = allWorkflowEntries[key].getAttribute("token");
                                var onlyProductionWorkflows = GenericSystem.getBoolPref("workflowStatusProductionOnly");
                                if ( (workflowStatus == null) || (typeof(workflowStatus) == "undefined") || (onlyProductionWorkflows && workflowStatus == 3) || (!onlyProductionWorkflows && workflowStatus < 4) ) {
                                    var itemUri = allWorkflowEntries[key].getAttribute("uri");
                                    if (itemUri.charAt(0) === '/') {
                                         itemUri = itemUri.substr(1);
                                    }
                                    newDocumentMenuItem.appendChild(GenericSystem.createMenuItem(GenericSystem.addURLParameter(localServerName + itemUri, "_AuthenticationKey=" + localToken), VRASystem.getWorkflowEntryLabel(allWorkflowEntries[key])));
                                }
                            }
                        }

                        indexServer++;
                    }
                }
                xhr.send(xmlString);
            }, function() {
                if (!errorState) {
                    GenericSystem.basicAlert(GenericSystem.getTranslation("vra-string-bundle", "button.configuration.atleast.one.server.connection.error"));
                }
                errorState = true;
            });
        }
    },
    
	run : function(e) {
		if (e == undefined) {
			a = 'default';
		} else {
			var a = e.target.getAttribute('value');
			if (a == '') a = 'default';
		}
		
		if (a == 'options') {
			window.open('chrome://vdocremoteaccess/content/advancedoptions.xul', '', 'chrome,centerscreen');
            return;
		}
        else if (a == 'about') {
			window.open('chrome://vdocremoteaccess/content/about.xul', '', 'chrome,centerscreen');
            return;
		}
        
        var allSC = VRAAdvancedOptions.getAllServerConfigurations();
        if (allSC.servers.length == 0) {
            GenericSystem.basicAlert(GenericSystem.getTranslation("vra-string-bundle", "button.configuration.atleast.one.server"));
            window.open('chrome://vdocremoteaccess/content/advancedoptions.xul', '', 'chrome,centerscreen');
            return;
        }
        
        if ( (a == 'mycurrenttasks') || (a == 'default') ) {
            window.open('chrome://vdocremoteaccess/content/mycurrenttasks.xul', '', 'chrome,centerscreen');
        }
        else if (a == 'mydelayedtasks') {
            window.open('chrome://vdocremoteaccess/content/mydelayedtasks.xul', '', 'chrome,centerscreen');
        }
        else if (a == 'myinterveneddocuments') {
            window.open('chrome://vdocremoteaccess/content/myinterveneddocuments.xul', '', 'chrome,centerscreen');
        }
        else if (a == 'activedocuments') {
            window.open('chrome://vdocremoteaccess/content/activedocuments.xul', '', 'chrome,centerscreen');
        }
        else if (a == 'favorites') {
            window.open('chrome://vdocremoteaccess/content/favorites.xul', '', 'chrome,centerscreen');
        }
        else {
            GenericSystem.openInANewTab(a);
        }
	}

};

window.addEventListener("load", function () { VRAButton.init(); }, false);
