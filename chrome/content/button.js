
VRAButton = {
	
	init: function () {
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
	
    loadWorkflows : function()
    {
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
        
        var serverName = VRASystem.validateServerName(GenericSystem.getPref("serverName"));
        VRASystem.doSecure(serverName, GenericSystem.getPref("login"), GenericSystem.getPref("password"), function(xhr) {
            var jsonResponse = JSON.parse(xhr.responseText);
            var token = jsonResponse.authenticate.body.token["@key"];
            
            var newDocumentMenuItem = document.getElementById("vra-context-new-document-menu");
            newDocumentMenuItem.innerHTML = '';
            newDocumentMenuItem.parentNode.value = '';
            
            var allWorkflowEntries = [];
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
                            allWorkflowEntries.push(workflowHeader);
                        }
                        catch(e) {}
                    }
                    
                    allWorkflowEntries.sort(function(a, b) {
                        if (a.getAttribute("name").toLowerCase() < b.getAttribute("name").toLowerCase())
                            return -1;
                        if (a.getAttribute("name").toLowerCase() > b.getAttribute("name").toLowerCase() )
                            return 1;
                        return 0;
                    });

                    for (var key in allWorkflowEntries) {
                        newDocumentMenuItem.appendChild(GenericSystem.createMenuItem(allWorkflowEntries[key].getAttribute("uri"), allWorkflowEntries[key].getAttribute("name")));
                    }
                }
            }
            xhr.send(xmlString);
        });       
    },
    
	run : function(e) {
		if (e == undefined) {
			a = 'default';
		} else {
			var a = e.target.getAttribute('value');
			if (a == '') a = 'default';
		}
		
		if (a == 'options') {
			window.open('chrome://vdocremoteaccess/content/options.xul', '', 'chrome,centerscreen');
		}
        else if (a == 'about') {
			window.open('chrome://vdocremoteaccess/content/about.xul', '', 'chrome,centerscreen');
		}
        else if (a == 'mycurrenttasks') {
            window.open('chrome://vdocremoteaccess/content/mycurrenttasks.xul', '', 'chrome,centerscreen');
        }
        else {
            var serverName = VRASystem.validateServerName(GenericSystem.getPref("serverName"));
            VRASystem.doSecure(serverName, GenericSystem.getPref("login"), GenericSystem.getPref("password"), function(xhr) {
                var jsonResponse = JSON.parse(xhr.responseText);
                var token = jsonResponse.authenticate.body.token["@key"];
                if (a.charAt(0) === '/') {
                     a = a.substr(1);
                }
                window.open(serverName + a + "&_AuthenticationKey=" + token);
            });
        }
	}

};

window.addEventListener("load", function () { VRAButton.init(); }, false);
