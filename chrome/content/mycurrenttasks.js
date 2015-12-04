
VRACurrentTasks = {
	
    init: function(mustCenter) {
        VRAGenericData.init(mustCenter);
    },
    
    findData: function(currentUserId, data) {
        return data;
    },
    
    customDataClassName: function(data) {
        var dataDateString = data.getElementsByTagName("header")[0].getAttribute("created-date");
        var dataDate = new Date(dataDateString).toLocaleFormat('%d-%b-%Y');
        if (dataDate == new Date().toLocaleFormat('%d-%b-%Y')) {
            return "cell-highlighted";
        }
        return "";
    },
    
    getXMLObject: function() {
        var xw = new XMLWriter('UTF-8');
        xw.writeStartDocument();
        xw.writeStartElement("view");
        xw.writeEndDocument();
        xw.writeAttributeString("xmlns:vw1", "http://www.axemble.com/process/view");
        xw.writeStartElement("header");
        xw.writeAttributeString("name", "ASSIGNED_TASKS");
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
        return xw;
    }

}

window.addEventListener("load", function () { VRACurrentTasks.init(true); }, false);