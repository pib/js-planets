var universe = {
    "width": 800000,
    "height": 800000,
    "bodies": [
        {
            "name": "Terra",
            "color": "#0000FF",
            "radius": 6371,
            "mass": 5.9736e+24,
            "position": {
                "x": 0,
                "y": 0
            },
            "velocity": {
                "x": 0,
                "y": 0
            }
        },
        {
            "name": "Luna",
            "color": "#FFFFFF",
            "radius": 1737.10,
            "mass": 7.3477e+22,
            "position": {
                "x": 363104,
                "y": 0
            },
            "velocity": {
                "x": 0,
                "y": 1.022
            }
        }
    ]
};


function init_canvas(canvas_id) {
    var canvas = document.getElementById(canvas_id);
    var ctx = canvas.getContext('2d');
    ctx.width = canvas.width;
    ctx.height = canvas.height;
    return ctx;
}

var twoPI = Math.PI * 2;
function draw_body(ctx, body) {
    ctx.fillStyle = body.color;
    ctx.beginPath();
    ctx.arc(body.position.x, body.position.y, body.radius, 0, twoPI, false);
    ctx.fill();
}

function draw_universe(ctx, universe) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.width, ctx.height);

    ctx.scale(ctx.width / universe.width, ctx.height / universe.height);
    ctx.translate(universe.width / 2, universe.height / 2);

    for(var i = 0; i < universe.bodies.length; i++) {
        draw_body(ctx, universe.bodies[i]);
    }
}

window.onload = function() {
    ctx = init_canvas('universe');
    draw_universe(ctx, universe);
};