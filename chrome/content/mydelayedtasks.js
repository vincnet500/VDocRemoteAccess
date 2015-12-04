
VRADelayedTasks = {
	
    init: function(mustCenter) {
        VRAGenericData.init(mustCenter);
    },
    
    findData: function(currentUserId, data) {
        return data;
    },
    
    customDataClassName: function(data) {
        return "";
    },
    
    getXMLObject: function() {
        var xw = new XMLWriter('UTF-8');
        xw.writeStartDocument();
        xw.writeStartElement("view");
        xw.writeEndDocument();
        xw.writeAttributeString("xmlns:vw1", "http://www.axemble.com/process/view");
        xw.writeStartElement("header");
        xw.writeAttributeString("name", "DELAYED_TASKS");
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

window.addEventListener("load", function () { VRADelayedTasks.init(true); }, false);