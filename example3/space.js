function debug(field, val) {
    var dbg_elem = document.getElementById('debug');
    if (!dbg_elem) {
        dbg_elem = document.createElement('DIV');
        dbg_elem.id = 'debug';
        document.getElementsByTagName('body')[0].appendChild(dbg_elem);
    }

    debug.data[field] = val;
    var debug_data = '<table>';
    for (var name in debug.data) {
        debug_data += '<tr><td>' + name + ' :</td><td class="data">' + debug.data[name] + '</td></tr>';
    }
    dbg_elem.innerHTML = debug_data;
}
debug.data = {};

var universe = {
    "G": 6.67428e-11,
    "time_multiplier": 60 * 60 * 24,
    "width": 800000,
    "height": 800000,
    "bodies": [
        {
            "name": "Terra",
            "color": "#0000FF",
            "radius": 6371.0,
            "mass": 5.9736e+24,
            "position": [0, 0],
            "velocity": [0, -0.0125]
        },
        {
            "name": "Luna",
            "color": "#FFFFFF",
            "radius": 1737.10,
            "mass": 7.3477e+22,
            "position": [363104.0, 0],
            "velocity": [0, 1.022]
        }/*,
        {
            "name": "Luna2",
            "color": "#FFFF00",
            "radius": 1737.10,
            "mass": 7.3477e+22,
            "position": [-363104.0, 0],
            "velocity": [-0.0, -1.022]
        }*/
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

var first = true;
function draw_universe(ctx, universe) {
    ctx.save();
    if (first) {
        ctx.fillStyle = 'rgba(0,0,0, 1)';
        ctx.fillRect(0, 0, ctx.width, ctx.height);
        first = false;
    }
    ctx.fillStyle = 'rgba(0,0,0, .004)';
    ctx.fillRect(0, 0, ctx.width, ctx.height);

    ctx.scale(ctx.width / universe.width, ctx.height / universe.height);
    ctx.translate(universe.width / 2, universe.height / 2);

    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(360000000, 360000000);
    ctx.stroke();

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
    var distance_vector = v2d_sub(attractor.position, attractee.position);
    var distance_km = v2d_length(distance_vector);
    var direction = v2d_div(distance_vector, distance_km);
    // positions are stored in kilometers, so we have to convert to meters
    var distance_m = distance_km * 1000;
    var g = (universe.G * attractor.mass) / (distance_m * distance_m);
    // velocities are also in km/s, so this needs to be scaled back down
    return v2d_mult(direction, g / 1000);
}

function step_universe(dt, universe) {
    for_each_body(universe, function(body) {
        debug(body.name + '.x', body.position[0].toFixed(2));
        debug(body.name + '.y', body.position[1].toFixed(2));
        // gravitate
        for_each_body(universe, function(sub_body) {
            if (sub_body != body) {
                var g = gravitation(universe, sub_body, body);
                body.velocity = v2d_add(body.velocity, v2d_mult(g, dt));
            }
        });
    });
    for_each_body(universe, function(body) {
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