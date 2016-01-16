define(['../collection/connection'], function(Connection) {
    
    return Backbone.View.extend({
        
        //el: document.getElementById("app"),
        
        //template: _.template(document.getElementById("tinterface-template")),
        
        connection: null,
        
        // these will be updated in the DOM.
        attrList: [
            "sRpm",
            "sSpeed",
            "sGear",
            "sEventTimeRemaining",
            "sCurrentTime",
            "sSplitTimeAhead",
            "sSplitTimeBehind",
            "sStability",
            "sTractionControl",
            "sABS",
            "sFuelLevel",
            "sTyreTemp"
        ],
        
        initialize: function() {
            
            this.connection = new Connection();
            this.connection.on("connect", this.enableRendering, this);
        },
        
        enableRendering: function() {
            
            var msg = {
                type: "subscribe",
                data: this.attrList
            }
            
            this.connection.conn.send(JSON.stringify(msg));
            
            setTimeout(_.bind(this.render, this), 60);
        },
        
        render: function() {
            var player = this.connection.get("1");
            
            for (var attr in this.attrList) {
                
                var value = player.get(this.attrList[attr]);
                if (typeof value == "object") { // data values that are grouped
                    for (var dataIdx in value) {
                        var el = document.getElementById(this.attrList[attr] + dataIdx);
                        
                        if (!el) {
                            continue;
                        }
                        // for e.g sTyreTemp0 gets value of sTyreTemp array with index 0
                        el.innerHTML = player.get(this.attrList[attr])[dataIdx];
                    }
                } else {
                    
                    var el = document.getElementById(this.attrList[attr]);
                        
                    if (!el) {
                        continue;
                    }
                        
                    el.innerHTML = player.get(this.attrList[attr]);
                }
            }
            
            setTimeout(_.bind(this.render, this), 60);
        },
    });
});