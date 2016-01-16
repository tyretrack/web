jQuery(document).ready(function () {

    var ws = new WebSocket("ws://" + window.location.hostname + ":8765/");

    var data = {};

    var out = jQuery('#output');

    var place = jQuery('#place');
    var lap = jQuery('#lap');

    var rpm = jQuery('.sRpm');

    var fuel = jQuery('#fuel');
    var fuelLevel = jQuery('#sFuelLevel');
    var speed = jQuery('#sSpeed');

    var abs = jQuery('#sABS');
    var tractionControl = jQuery('#sTractionControl');
    var stability = jQuery('#sStability');

    var numParticipants = jQuery('#sNumParticipants');
    var sEventTimeRemaining = jQuery('#sEventTimeRemaining');
    var sCurrentTime = jQuery('#sCurrentTime');
    var sSplitTimeAhead = jQuery('#sSplitTimeAhead');
    var sSplitTimeBehind = jQuery('#sSplitTimeBehind');
    var sGear = jQuery('#sGear');
    var fuelPercent = jQuery('#fuelPercent');
    var fuelLitres = jQuery('#fuelLitres');
    var rpmPercent = jQuery('.rpmPercent');

    var sAmbientTemperature = jQuery('#sAmbientTemperature');
    var sCurrentLapDistance = jQuery('#sCurrentLapDistance');

    var map = jQuery('#map');
    // x: -1700 - 4364
    // 1800 - 4400
    // y: 0 - 5372
    // 0 - 5400
    var maxX = 1800, maxY = 0, minX = -1700, minY = 5400;

    var mapWidth = map[0].width;
    var mapHeight = map[0].height;

    var xModulator = ((maxX - minX) + mapWidth / 2);
    var yModulator = ((maxY - minY) + mapHeight / 2);

    var currRpmColor = "progress-success";
    var currFuelColor = "progress-success";

    var tyreGripProbes = [];

    var logged = false;
    ws.onopen = function (event) {
        out.text("connected");
        var msg = {
            type: "subscribe",
            data: ["sRpm",
                "sSpeed",
                "sGear",
                "sFuelLevel",
                "sParticipationInfo",
                "sTyreGrip",
                "sTyreTemp",
                "sTyreWear",
                "sEventTimeRemaining",
                "sNumParticipants",
                "sCurrentTime",
                "sSplitTimeAhead",
                "sSplitTimeBehind",
                "sAmbientTemperature",
            ]
        };
        ws.send(JSON.stringify(msg));
    };

    var funcUpdate = function () {
        var c = data;

        place.html(c.sParticipationInfo[0].sRacePosition);
        lap.html(c.sParticipationInfo[0].sCurrentLap);

        rpm.html(c.sRpm);
        var rpmPercentValue = ((c.sRpm / c.sMaxRpm) * 100);
        rpmPercent.width(rpmPercentValue + "%");

        var newRpmColor = "progress-bar-success";
        if (rpmPercentValue > 90) {
            newRpmColor = "progress-bar-danger";
        } else if (rpmPercentValue > 70) {
            newRpmColor = "progress-bar-warning";
        }

        if (newRpmColor != currRpmColor) {
            rpmPercent.removeClass("progress-bar-success");
            rpmPercent.removeClass("progress-bar-warning");
            rpmPercent.removeClass("progress-bar-danger");
            rpmPercent.addClass(newRpmColor);
        }

        var fuel = Math.round(c.sFuelLevel * 100);
        fuelLevel.html(fuel + "%");

        var newFuelColor = "progress-bar-success";
        if (fuel < 10) {
            newFuelColor = "progress-bar-danger";
        }

        if (newFuelColor != currFuelColor) {
            fuelPercent.removeClass("progress-bar-success");
            fuelPercent.removeClass("progress-bar-warning");
            fuelPercent.removeClass("progress-bar-danger");
            fuelPercent.addClass(newFuelColor);
        }

        fuelLitres.html((c.sFuelLevel*100).toFixed(1) + " l");
        speed.html(Math.round((c.sSpeed * 60 * 60) / 1000));
        numParticipants.html(c.sNumParticipants);

        sEventTimeRemaining.html(Math.round(c.sEventTimeRemaining / 60) + " min");
        sCurrentTime.html(c.sCurrentTime.toFixed(1));
        sSplitTimeAhead.html(c.sSplitTimeAhead.toFixed(1));
        sSplitTimeBehind.html(c.sSplitTimeBehind.toFixed(1));
        sGear.html(c.sGear);
        sAmbientTemperature.html(c.sAmbientTemperature + " °C");
        sCurrentLapDistance.html((c.sParticipationInfo[0]['sCurrentLapDistance'] / 1000).toFixed(2)  + " km");

        // process data for the tyres
        for (var idx = 0; idx < 4; idx++) {

            if (typeof tyreGripProbes[idx] === 'undefined') {
                tyreGripProbes[idx] = [];
            }

            if (tyreGripProbes[idx].length >= 200) {
                tyreGripProbes.pop();
            }

            tyreGripProbes[idx].shift(c.sTyreGrip[idx]);

            var tyreGripAvg = 0;
            var tyreGripSum = 0;
            for (var i = 0; i < tyreGripProbes.length; i++) {
                tyreGripSum += tyreGripProbes[i];
            }
            tyreGripAvg = tyreGripSum / tyreGripProbes[idx].length;

            jQuery('#sTyreTemp' + idx).html(c['sTyreTemp'][idx]);
            jQuery('#sTyreWear' + idx).html(c['sTyreWear'][idx]);
            jQuery('#sTyreGrip' + idx).html(tyreGripAvg);
        }

        // MAP

        var ctx = map[0].getContext("2d", {alpha: true});

        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.font = "12px sans";

        function draw(info, idx) {
            var pos = info.sWorldPosition;

            // x: -1700 - 4364
            // 1800 - 4400
            // y: 0 - 5372
            // 0 - 5400

            var x = (pos[0] + 1900) / 10.0;
            var y = (pos[2] - 5500) / -10.0;

            x *= 0.6025;
            y *= 0.61;

            x += 46;
            y += 58;

            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = "black";

            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.fillText(idx, x, y);
        }

        for (var i = 0; i < c.sParticipationInfo.length; i++) {
            draw(c.sParticipationInfo[i], i);
        }

        ctx.fillStyle = "red";
        ctx.strokeStyle = "red";
        draw(c.sParticipationInfo[0], 0);
    };


    var lastUpdate = undefined;
    ws.onmessage = function (ev) {
        var parsed = JSON.parse(ev.data);
        var c = parsed['c'];
        for (var key in c) {
            if (c.hasOwnProperty(key)) {
                data[key] = c[key];
            }
        }

        if (!logged) {
            console.log(c);
            logged = true;
        }

        window.cancelAnimationFrame(lastUpdate);
        lastUpdate = window.requestAnimationFrame(funcUpdate);
    };

    var width = map[0].width;
    var height = map[0].height;
});
