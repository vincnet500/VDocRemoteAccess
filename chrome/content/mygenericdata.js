
VRAGenericData = {
	
	init: function(mustCenter) {
        GenericSystem.showLoading('vra-loading', true);
        var allWorkflows = [];
        var localWorkflowPopup = null;
        VRASystem.doSecure('', '', '', function(xhr) {
            var jsonResponse = JSON.parse(xhr.responseText);
            var token = jsonResponse.authenticate.body.token["@key"];
            
            var xw = new XMLWriter('UTF-8');
            xw.writeStartDocument();
            xw.writeStartElement("view");
            xw.writeEndDocument();
            xw.writeAttributeString("xmlns:vw1", "http://www.axemble.com/process/view");
            xw.writeStartElement("header");
            xw.writeAttributeString("name", "WORKFLOWS");
            xw.writeEndElement();
            xw.writeEndElement();
            
            VRASystem.initCommonList("workflowName", token, "workflow", "cmd", xw, "view/body/workflow", true, function(popup, elem)  {
                localWorkflowPopup = popup;
                allWorkflows.push(elem);
            }, function() {
                allWorkflows.sort(function(a, b) {
                    if (a.getElementsByTagName("header")[0].getAttribute("name").toLowerCase() < b.getElementsByTagName("header")[0].getAttribute("name").toLowerCase())
                        return -1;
                    if ( a.getElementsByTagName("header")[0].getAttribute("name").toLowerCase() > b.getElementsByTagName("header")[0].getAttribute("name").toLowerCase() )
                        return 1;
                    return 0;
                });
                for (var key in allWorkflows) {
                    if (allWorkflows[key].getElementsByTagName("header")[0].getAttribute("status") < 4) {
                        localWorkflowPopup.appendChild(GenericSystem.createMenuItem(allWorkflows[key].getElementsByTagName("header")[0].getAttribute("name"), allWorkflows[key].getElementsByTagName("header")[0].getAttribute("label")));
                    }
                }
                GenericSystem.showLoading('vra-loading', false);
            });
        });
        
        var listBox = document.getElementById("dataTable");
        listBox.addEventListener("dblclick", function(event) {
            var target = event.target;
            while (target && target.localName != "listitem") {
                target = target.parentNode;
            }
            if (!target) {
                return;
            }
            VRASystem.doSecure('', '', '', function(xhr) {
                var jsonResponse = JSON.parse(xhr.responseText);
                var token = jsonResponse.authenticate.body.token["@key"];
                
                var uri = target.getAttribute("uri");
                var serverName = VRASystem.validateServerName(GenericSystem.getPref("serverName"));
                if (uri.charAt(0) === '/') {
                     uri = uri.substr(1);
                }
                
                GenericSystem.openInANewTab(serverName + uri + "&_AuthenticationKey=" + token);
            });
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
        
        VRASystem.doSecure('', '', '', function(xhr) {
            var jsonResponse = JSON.parse(xhr.responseText);
            var token = jsonResponse.authenticate.body.token["@key"];
            
            var xw = getXMLObject();
            var subXhr = new XMLHttpRequest();
            var serverName = VRASystem.validateServerName(GenericSystem.getPref("serverName"));
            subXhr.open("POST", serverName + "navigation/flow?module=workflow&cmd=cmd&killsession=false&_AuthenticationKey=" + token, true);
            subXhr.onreadystatechange = function() {
                if (subXhr.readyState == 4) {
                    if (subXhr.status == 200) {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(subXhr.responseText, "application/xml"); 
                        var elementArray = xmlDoc.getElementsByTagName("view")[0].getElementsByTagName("body")[0].getElementsByTagName("element");
                        var allDocuments = [];
                        
                        for (var key in elementArray) {
                            var documentElement = elementArray[key];
                            try {
                                allDocuments.push(documentElement);
                            }
                            catch(e) {}
                        }
                        
                        allDocuments.sort(function(a, b) {
                            try {
                                if (new Date(a.getElementsByTagName("header")[0].getAttribute("created-date")) < new Date(b.getElementsByTagName("header")[0].getAttribute("created-date")))
                                    return 1;
                                if (new Date(a.getElementsByTagName("header")[0].getAttribute("created-date")) > new Date(b.getElementsByTagName("header")[0].getAttribute("created-date")))
                                    return -1;
                            }
                            catch (e) {}
                            return 0;
                        });
                        
                        for (var key in allDocuments) {
                            try {
                                var headerNode = allDocuments[key].getElementsByTagName("header")[0];
                                if (headerNode.getElementsByTagName("resource-definition")[0].getAttribute("name") == workflowName) {
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
                                    
                                    GenericSystem.appendListBox("dataTable", customDataClassName(elementNode), headerNode.getAttribute("uri"), [reference, (title.length > 60?title.substring(0, 57) + "...":title), creator, creationDate, currentSteps, documentState]);
                                }
                            }
                            catch (e) {}
                        }
                        
                        GenericSystem.showLoading('vra-loading', false);
                    }
                }
            }
            subXhr.send(xw.flush());
        });
    }

}
