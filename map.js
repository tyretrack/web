jQuery(document).ready(function () {


    var ws = new WebSocket("ws://" + window.location.hostname + ":8765/");
    var out = jQuery('#output');

    var data = {};

    var map = jQuery('#map');

    //var offlineCV = document.createElement('canvas');
    //offlineCV.width = 800*1.5;
    //offlineCV.height = 600*1.5;

    var logged = false;
    ws.onopen = function (event) {
        out.text("connected");
        var msg = {
            type: "subscribe",
            data: ["sParticipationInfo"]
        }
        ws.send(JSON.stringify(msg));
    };

    var maxX = 0, maxY = 0, minX = 0, minY = 0;

    var funcUpdate = function() {
        var c = data;

        var ctx = map[0].getContext("2d", {alpha: false});

        var width = map[0].width;
        var height = map[0].height;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.font = "14px sans";

        function draw(info, idx) {
            var pos = info.sWorldPosition;

            // x: -1700 - 4364
            // 1800 - 4400
            // y: 0 - 5372
            // 0 - 5400

            var x = (pos[0] + 1900) / 10.0;
            var y = (pos[2] - 5500) / -10.0;

            ctx.beginPath();
            ctx.arc(x, y, 12, 0, 2 * Math.PI);
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

    ws.onmessage = function (ev) {

        var parsed = JSON.parse(ev.data);
        var c = parsed.c;
        var m = parsed.m;

        data = c;

        if (!logged) {
            console.log(c);
            logged = true;
            jQuery('#output').html(JSON.stringify(parsed, null, 2));
        }

        window.requestAnimationFrame(funcUpdate);
    };

    var ctx = map[0].getContext("2d", {alpha: false});
    var width = map[0].width;
    var height = map[0].height;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
});