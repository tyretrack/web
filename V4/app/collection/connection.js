define(['../model/player'], function(Player){
    return Backbone.Collection.extend({
        
        model: Player,
        
        conn: null,
        
        connected: false,
        
        initialize: function() {
            
            this.conn = new WebSocket("ws://192.168.0.13:8765/");
            
            this.conn.onopen = _.bind(this.onOpen, this);
            this.conn.onmessage = _.bind(this.onMessage, this);
            this.conn.onclose = this.onOClose
            this.conn.onerror = this.onError

            this.on("add", this.onAdd);
            
        },
        
        onMessage: function(evt) {
            var data = JSON.parse(evt.data);
            data.c.id = 1;
            
            this.add(data.c, {merge:true, parse: true});
        },
        
        onClose: function() {
            if(this.connected) {
                alert("The connection to the server was closed");
            } else {
                alert("Could not establish connection to server.");
            }
            console.log("disconnected");
        },
        
        onError: function() {
            console.log("disconnected error");
        },
        
        onOpen: function() {
            this.connected = true;
            this.trigger("connect");
            console.log("connected");
        }
    });
});