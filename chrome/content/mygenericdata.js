
VRAGenericData = {
	
	init: function(mustCenter, getXMLObject) {
        GenericSystem.showLoading('vra-loading', true);
        var allWorkflows = [];
        var localWorkflowPopup = null;
        VRASystem.doSecure('', '', '', function(xhr) {
            var jsonResponse = JSON.parse(xhr.responseText);
            var token = jsonResponse.authenticate.body.token["@key"];
            VRASystem.initCommonList("workflowName", token, "workflow", "cmd", getXMLObject(), "view/body/workflow", true, function(popup, elem)  {
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
                    localWorkflowPopup.appendChild(GenericSystem.createMenuItem(allWorkflows[key].getElementsByTagName("header")[0].getAttribute("protocol-uri"), allWorkflows[key].getElementsByTagName("header")[0].getAttribute("name")));
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
            console.error(target.getAttribute("value"));
        }, false);
        
        if (mustCenter) {
            var w = (screen.availWidth/2) - (window.innerWidth/2);
            var h = (screen.availHeight/2) - (window.innerHeight/2);
            window.moveTo(w,h);
        }
	},
    
    loadData : function(viewType, findDataFunction, customDataClassName) {
        GenericSystem.showLoading('vra-loading', true);
        GenericSystem.cleanListBox("dataTable");
        
        var workflowProtocolUri = GenericSystem.getMenuPopupValue("workflowName"); 
        
        VRASystem.doSecure('', '', '', function(xhr) {
            var jsonResponse = JSON.parse(xhr.responseText);
            var token = jsonResponse.authenticate.body.token["@key"];
            
            var xw = new XMLWriter('UTF-8');
            xw.writeStartDocument();
            xw.writeStartElement("view");
            xw.writeEndDocument();
            xw.writeAttributeString("xmlns:vw1", "http://www.axemble.com/process/view");
            xw.writeStartElement("header");
            xw.writeAttributeString("name", viewType);
            xw.writeStartElement("column");
            xw.writeAttributeString("name", "sys_Reference");
            xw.writeEndElement();
            xw.writeStartElement("column");
            xw.writeAttributeString("name", "sys_Title");
            xw.writeEndElement();
            xw.writeStartElement("column");
            xw.writeAttributeString("name", "sys_Creator");
            xw.writeEndElement();
            xw.writeStartElement("column");
            xw.writeAttributeString("name", "sys_CreationDate");
            xw.writeEndElement();
            xw.writeStartElement("column");
            xw.writeAttributeString("name", "sys_CurrentSteps");
            xw.writeEndElement();
            xw.writeStartElement("column");
            xw.writeAttributeString("name", "DocumentState");
            xw.writeEndElement();
            xw.writeEndElement();
            xw.writeEndElement();
            
            var subXhr = new XMLHttpRequest();
            var serverName = VRASystem.validateServerName(GenericSystem.getPref("serverName"));
            subXhr.open("POST", serverName + "navigation/flow?module=workflow&cmd=cmd&killsession=false&_AuthenticationKey=" + token, true);
            subXhr.onreadystatechange = function() {
                if (subXhr.readyState == 4) {
                    if (subXhr.status == 200) {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(subXhr.responseText, "application/xml"); 
                        var elementArray = xmlDoc.getElementsByTagName("view")[0].getElementsByTagName("body")[0].getElementsByTagName("element");
                        for (var key in elementArray) {
                            try {
                                var headerNode = elementArray[key].getElementsByTagName("header")[0];
                                if (headerNode.getElementsByTagName("resource-definition")[0].getAttribute("name") == workflowProtocolUri) {
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
                                                creationDate = aValue;
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
                                    
                                    console.error(reference);
                                    console.error(title);
                                    console.error(creator);
                                    console.error(creationDate);
                                    console.error(currentSteps);
                                    console.error(documentState);
                                    
                                    GenericSystem.appendListBox("dataTable", "", [reference, title, creator, creationDate, currentSteps, documentState]);
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
