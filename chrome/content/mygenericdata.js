
VRAGenericData = {
	
	init: function(mustCenter) {
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

                VRASystem.initCommonList(serverName, "workflowName", token, "workflow", "cmd", xw, "view/body/workflow", (indexServer == allSC.servers.length - 1), function(popup, elem)  {
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
        
        var listBox = document.getElementById("dataTable");
        listBox.addEventListener("dblclick", function(event) {
            var target = event.target;
            while (target && target.localName != "listitem") {
                target = target.parentNode;
            }
            if (!target) {
                return;
            }
            GenericSystem.openInANewTab(target.getAttribute("uri"));
        }, false);
        
        if (mustCenter) {
            var w = (screen.availWidth/2) - (window.innerWidth/2);
            var h = (screen.availHeight/2) - (window.innerHeight/2);
            window.moveTo(w,h);
        }
	},
    
    loadData : function(getXMLObject, findDataFunction, customDataClassName) {
        GenericSystem.showLoading('vra-loading', true);
        GenericSystem.cleanListBox("dataTable");
        
        var workflowName = GenericSystem.getMenuPopupValue("workflowName"); 
        var allDocuments = [];
        
        var indexServer = 0;
        var allSC = VRAAdvancedOptions.getAllServerConfigurations();
        for (var key in allSC.servers) {
            var serverConfiguration = allSC.servers[key];
            var serverName = VRASystem.validateServerName(serverConfiguration.serverURL);
            VRASystem.doSecure(serverConfiguration.configurationName, serverName, serverConfiguration.serverLogin, serverConfiguration.serverPassword, false, function(configurationName, serverName, token) {
                var xw = getXMLObject();
                var subXhr = new XMLHttpRequest();
                subXhr.open("POST", serverName + "navigation/flow?module=workflow&cmd=cmd&killsession=false&_AuthenticationKey=" + token, true);
                subXhr.onreadystatechange = function() {
                    if (subXhr.readyState == 4) {
                        if (subXhr.status == 200) {
                            var parser = new DOMParser();
                            var xmlDoc = parser.parseFromString(subXhr.responseText, "application/xml"); 
                            var elementArray = xmlDoc.getElementsByTagName("view")[0].getElementsByTagName("body")[0].getElementsByTagName("element");

                            for (var key in elementArray) {
                                var documentElement = elementArray[key];
                                try {
                                    documentElement.setAttribute("serverName", serverName);
                                    documentElement.setAttribute("token", token);
                                    allDocuments.push(documentElement);
                                }
                                catch(e) {}
                            }

                            if (indexServer == allSC.servers.length - 1) {
                                var cleanedDocuments = [];
                                for (var key in allDocuments) {
                                    try {
                                        var headerNode = allDocuments[key].getElementsByTagName("header")[0];
                                        if (headerNode.getElementsByTagName("resource-definition")[0].getAttribute("name") == workflowName) {
                                            cleanedDocuments.push(allDocuments[key]);
                                        }
                                    }
                                    catch (e) {}
                                }
                                
                                cleanedDocuments.sort(function(a, b) {
                                    try {
                                        if (new Date(a.getElementsByTagName("header")[0].getAttribute("created-date")) <= new Date(b.getElementsByTagName("header")[0].getAttribute("created-date")))
                                            return 1;
                                        if (new Date(a.getElementsByTagName("header")[0].getAttribute("created-date")) >= new Date(b.getElementsByTagName("header")[0].getAttribute("created-date")))
                                            return -1;
                                    }
                                    catch (e) {}
                                    return 0;
                                });

                                for (var key in cleanedDocuments) {
                                    try {
                                        var headerNode = cleanedDocuments[key].getElementsByTagName("header")[0];
                                        var localServerName = cleanedDocuments[key].getAttribute("serverName");
                                        var localToken = cleanedDocuments[key].getAttribute("token");
                                        var elementNode = headerNode.parentNode;

                                        var reference = "";
                                        var title = "";
                                        var creator = "";
                                        var creationDate = "";
                                        var currentSteps = "";
                                        var documentState = "";

                                        var bodyValues = elementNode.getElementsByTagName("body")[0].childNodes;
                                        for (var key in bodyValues) {
                                            try {
                                                var aName = bodyValues[key].getAttribute("name");
                                                var aValue = bodyValues[key].getAttribute("value");
                                                if (aName == "sys_Reference") {
                                                    reference = aValue;
                                                }
                                                else if (aName == "sys_Title") {
                                                    title = aValue;
                                                }
                                                else if (aName == "sys_Creator") {
                                                    creator = bodyValues[key].getAttribute("first-name") + " " + bodyValues[key].getAttribute("last-name");
                                                }
                                                else if (aName == "sys_CreationDate") {
                                                    creationDate = new Date(aValue).toLocaleFormat('%d-%b-%Y');
                                                }
                                                else if (aName == "sys_CurrentSteps") {
                                                    currentSteps = aValue;
                                                }
                                                else if (aName == "DocumentState") {
                                                    documentState = aValue;
                                                }
                                            }
                                            catch (e) {}
                                        }

                                        var itemUri = headerNode.getAttribute("uri");
                                        if (itemUri.charAt(0) === '/') {
                                             itemUri = itemUri.substr(1);
                                        }
                                        GenericSystem.appendListBox("dataTable", customDataClassName(elementNode), GenericSystem.addURLParameter(localServerName + itemUri, "_AuthenticationKey=" + localToken), [reference, (title.length > 60?title.substring(0, 57) + "...":title), creator, creationDate, currentSteps, documentState]);
                                    }
                                    catch (e) {}
                                }
                                                                
                                GenericSystem.showLoading('vra-loading', false);
                            }

                            indexServer++;
                        }
                    }
                }
                subXhr.send(xw.flush());
            }, function() {});
        }
    }

}
