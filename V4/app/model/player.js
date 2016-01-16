define([], function(){
    
    var filters = {
        round: function(value) {
                return Math.round(value); 
            },
            speed: function (value) {
                return (value * 60 * 60) / 1000;
            },
            gear: function (value) {
                // gear 15 is backwars!
                switch (value) {
                    case 0:
                        return "N"
                    case 15:
                        return "R"
                    default:
                        return value;
                }
            },
            secondsToReadableDuration: function(seconds) {
                var hours = Math.floor(seconds / 60 / 60);
                var minutes = Math.floor(seconds / 60 % 60);
                var sec = Math.floor(seconds % 60);
                
                if (hours < 10) {
                    hours = "0" + hours;
                }
                
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                
                if (sec < 10) {
                    sec = "0" + sec;
                }
                
                return hours + ":" + minutes + ":" + sec
            },
            splitTime: function(value) {
                return value == -1 ? "/" : value;
            }
    }
    
    return Backbone.Model.extend({
        
        defaults: {
            sRpm: 0,
            sSpeed: 0,
            sGear: 0,
            sFuelLevel: 0,
            sParticipationInfo: [],
            /*sTyreGrip: [
                0, 0, 0, 0          // value for each tyre
            ],
            sTyreTemp: [
                0, 0, 0, 0
            ],
            sTyreWear: [
                0, 0, 0, 0
            ],*/
            sEventTimeRemaining: 0, // event time remaining in seconds
            sNumParticipants: 0,
            sCurrentTime: 0, // in seconds
            sSplitTimeAhead: 0, // in sec
            sSplitTimeBehind: 0, // in sec
        },
        
        applyFilters: {
            "sCurrentTime": [filters.secondsToReadableDuration],
            "sSpeed": [filters.speed, filters.round],
            "sEventTimeRemaining": [filters.secondsToReadableDuration],
            "sGear": [filters.gear],
            "sSplitTimeAhead": [filters.splitTime],
            "sSplitTimeBehind": [filters.splitTime]
        },
        
        initialize: function() {
            console.log(this);
            //this.on("change", this.onChange)
        },
        
        parse: function(data) {
            
            for (var attr in this.applyFilters) {
                
                if (!data.hasOwnProperty(attr)) {
                    continue;
                }
                
                for (var idx in this.applyFilters[attr]) {
                    var filter = this.applyFilters[attr][idx]
                    data[attr] = filter(data[attr]);
                }
            }
            
            return data
        }
    });
});