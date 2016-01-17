define(['../collection/connection'], function(Connection) {
    
    var RenderOverwrite = {
        // renders the controls elements diffrently
        controls: function(el, value, player, idx) {
            var target = $(el);
            if (value) {
                target.removeClass("status-off");
                target.addClass("status-on");
            } else {
                target.removeClass("status-on");
                target.addClass("status-off");
            }
        },
        
        tyre: function(el, value, player, idx) {
            var target = $(el);
            target.html(value);
            target.height(player.get("sTyreWear")[idx] + "%");
        },
        
        fuel: function(el, value, player) {
            el.innerHTML = (player.get("sFuelLevel") * player.get("sFuelCapacity")).toFixed(2) + "l"
        },
        
        position: function(el, value, player) {
            console.log(player.get("sParticipationInfo")[0].sRacePosition);
            el.innerHTML = player.get("sParticipationInfo")[0].sRacePosition;
        }
    }
    
    return Backbone.View.extend({
        
        connection: null,
        
        /** 
         * These will be subscribed to.
         * DOM elemnts with the ID of these key will get the value of them in their innerHTML
         * You can override the default behavoir of rendering in innerHTML by adding an overwrite. 
         */
        attrList: {
            sRpm: null,
            sSpeed: null,
            sGear: null,
            sEventTimeRemaining: null,
            sCurrentTime: null,
            sSplitTimeAhead: null,
            sSplitTimeBehind: null,
            sStability: RenderOverwrite.controls,
            sTractionControl: RenderOverwrite.controls,
            sABS: RenderOverwrite.controls,
            sFuelLevel:RenderOverwrite.fuel,
            sTyreTemp: RenderOverwrite.tyre,
            sTyreWear: null,
            sParticipationInfo: RenderOverwrite.position
        },
        
        initialize: function() {
            
            this.connection = new Connection();
            this.connection.on("connect", this.enableRendering, this);
        },
        
        enableRendering: function() {
            
            var msg = {
                type: "subscribe",
                data: _.keys(this.attrList)
            }
            
            this.connection.conn.send(JSON.stringify(msg));
            
            setTimeout(_.bind(this.render, this), 80);
        },
        
        render: function() {
            var player = this.connection.get("1");
            
            for (var attr in this.attrList) {
                
                var value = player.get(attr);
                if (typeof value == "object") { // data values that are grouped
                    for (var dataIdx in value) {
                        var el = document.getElementById(attr + dataIdx);
                        
                        if (!el) {
                            continue;
                        }
                        
                        if (!this.attrList[attr]) {
                            // for e.g sTyreTemp0 gets value of sTyreTemp array with index 0
                            el.innerHTML = player.get(attr)[dataIdx];
                        } else {
                            this.attrList[attr](el, player.get(attr)[dataIdx], player, dataIdx)
                        }
                        
                    }
                } else {
                    
                    var el = document.getElementById(attr);
                        
                    if (!el) {
                        continue;
                    }
                        
                    if (!this.attrList[attr]) {
                        // for e.g sTyreTemp0 gets value of sTyreTemp array with index 0
                        el.innerHTML = player.get(attr);
                    } else {
                        this.attrList[attr](el, player.get(attr), player, null)
                    }
                }
            }
            
            setTimeout(_.bind(this.render, this), 80);
        },
    });
});