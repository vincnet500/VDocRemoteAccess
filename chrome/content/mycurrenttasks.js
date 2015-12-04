
VRACurrentTasks = {
	
    init: function(mustCenter) {
        VRAGenericData.init(mustCenter, this.getXMLObject);
    },
    
    findData: function(currentUserId, data) {
        // We return all tickets : we only have "opened" tickets in generic source
        return data;
    },
    
    customDataClassName: function(currentUserId, data) {
        //return "cell-highlighted";
        return "";
    },
    
    getXMLObject: function() {
        var xw = new XMLWriter('UTF-8');
        xw.writeStartDocument();
        xw.writeStartElement("view");
        xw.writeEndDocument();
        xw.writeAttributeString("xmlns:vw1", "http://www.axemble.com/process/view");
        xw.writeStartElement("header");
        xw.writeAttributeString("name", "WORKFLOWS");
        xw.writeEndElement();
        xw.writeEndElement();
        return xw;
    }

}

window.addEventListener("load", function () { VRACurrentTasks.init(true); }, false);