var universe = {
    "G": 6.67428e-11,
    "time_multiplier": 60 * 60 * 24,
    "width": 800000,
    "height": 800000,
    "bodies": [
        {
            "name": "Terra",
            "color": "#0000FF",
            "radius": 6371,
            "mass": 5.9736e+24,
            "position": [0, 0],
            "velocity": [0, 0]
        },
        {
            "name": "Luna",
            "color": "#FFFFFF",
            "radius": 1737.10,
            "mass": 7.3477e+22,
            "position": [363104, 0],
            "velocity": [0, 1.022]
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

function for_each_body(universe, callback, extra_params) {
    extra_params = extra_params || [];
    var bodies = universe.bodies;
    var len = bodies.length;
    for(var i = 0; i < len; i++)
        callback(bodies[i]);
}

var twoPI = Math.PI * 2;
function draw_body(ctx, body) {
    ctx.save();
    ctx.fillStyle = ctx.strokeStyle = body.color;
    ctx.beginPath();
    ctx.arc(body.position[0], body.position[1], body.radius, 0, twoPI, false);
    ctx.fill();
    ctx.restore();
}

function draw_universe(ctx, universe) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.width, ctx.height);

    ctx.scale(ctx.width / universe.width, ctx.height / universe.height);
    ctx.translate(universe.width / 2, universe.height / 2);

    for_each_body(universe, function(body) {
        draw_body(ctx, body);
    });
    ctx.restore();
}

function v2d_mult(v, scalar) {
    return [v[0] * scalar, v[1] * scalar];
}

function v2d_div(v, scalar) {
    return [v[0] / scalar, v[1] / scalar];
}

function v2d_add(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

function v2d_sub(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1]];
}

function v2d_length(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

function gravitation(universe, attractor, attractee) {
    var dr = v2d_sub(attractor, attractee);
    var r = v2d_length(dr);
    var d = v2d_div(dr, r);
    var g = -(universe.G * attractor.mass) / (r * r);
    return v2d_mult(d, g);
}

function step_universe(dt, universe) {
    for_each_body(universe, function(body) {
        // gravitate
        for_each_body(universe, function(sub_body) {
            if (sub_body != body) {
                var g = gravitation(universe, sub_body, body);
                body.velocity = v2d_add(body.velocity, v2d_mult(g, dt));
            }
        });
        body.position = v2d_add(body.position,
                                v2d_mult(body.velocity, dt));
    });
}

function main_loop(ctx, universe) {
    var now = (new Date()).getTime();
    var dt = (now - universe.last_tick) / 1000 * universe.time_multiplier;
    step_universe(dt, universe);
    draw_universe(ctx, universe);
    universe.last_tick = now;
}

window.onload = function() {
    ctx = init_canvas('universe');
    universe.last_tick = (new Date()).getTime();
    draw_universe(ctx, universe);

    setInterval(function() { main_loop(ctx, universe); }, 50);
};