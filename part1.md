Simulating a Solar System in JavaScript
=======================================

I've recently had my interest in writing video games rekindled, and
I've got a ton of ideas for games to write. I want to start small and
work my way up to more complex games, so I decided to start with a
fairly simple 2D gravity simulation.

The simulation will be written incrementally as well, so I will
document the steps I take from start to finish.


Step 1: Defining and drawing the "universe"
-------------------------------------------

Before I get into the physics of gravity, I need to define the format
of my universe and write the code needed to draw it.

To start with, the bodies in the simulation are going to be
circles. Each body needs to have its size, position, velocity, and
mass defined. Size and mass are separate to accomidate bodies of
different densities.

I'll use a simple JSON-compatible format for the universe, so in the
future I can store universes in separate files.

<pre lang="javascript">
var universe = {
    "width_px": 600,
    "height_px": 600,
    "width": 800000,
    "height": 800000,
    "bodies": [
        {
            "name": "Terra",
            "radius": 6371,
            "mass": 5.9736e+24,
            "position" [0, 0],
            "velocity": [0, 0]
        },
        {
            "name": "Luna",
            "radius": 1737.10,
            "mass": 7.3477e+22,
            "position": [363104, 0],
            "velocity": [0, 1.022]
            }
        }
    ]
};
</pre>

Besides *width_px* and *height_px*, all distances are in kilometers,
all masses are in kilograms, and all velocities are in kilometers per
second. The names are there simply for identification at the moment.

With a canvas of 600x600 pixels, Luna will be about 2.6 pixels in
diameter and Terra will be about 9.5 pixels (the Moon is really
freaking far away, in case you didn't know!).

Assuming the code to initialize the canvas has already been taken care
of, we now need to be able to draw this newly-defined universe.

<pre lang="javascript">
var twoPI = Math.PI * 2;
function draw_body(ctx, body) {
    ctx.fillStyle = body.color;
    ctx.beginPath();
    ctx.arc(body.position[0], body.position[1], body.radius, 0, twoPI, false);
    ctx.fill();
}

function draw_universe(ctx, universe) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.width, ctx.height);

    ctx.scale(ctx.width / universe.width, ctx.height / universe.height);
    ctx.translate(universe.width / 2, universe.height / 2);

    for(var i = 0; i < universe.bodies.length; i++) {
        draw_body(ctx, universe.bodies[i]);
    }
    ctx.restore();
}
</pre>

The *draw_universe* function first draws a solid black background,
then transforms the canvas to match the size of the universe and
center the origin.

The end result is this:

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/misterpib/W6Ltn/embedded/"></iframe>


Step 2: Adding motion
---------------------

A static universe isn't particularly interesting, so next I'll add
some motion.

<pre lang="javascript">
function v2d_mult(v, scalar) {
    return [v[0] * scalar, v[1] * scalar];
}

function v2d_add(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

function step_universe(dt, universe) {
    for_each_body(universe, function(body) {
        console.log(body.position);
        body.position = v2d_add(body.position,
                                v2d_mult(body.velocity, dt));
        console.log(body.position);
    });
}

function main_loop(ctx, universe) {
    var now = (new Date()).getTime();
    var dt = (now - universe.last_tick) / 1000 * universe.time_multiplier;
    step_universe(dt, universe);
    draw_universe(ctx, universe);
    universe.last_tick = now;
}

// in the onload function:
    setInterval(function() { main_loop(ctx, universe); }, 50);
</pre>

I've added a couple of vector convenience functions, a step function,
and a main loop function.

The main loop function determines the amount of time since its last
call, then calls step_universe and draw_universe. JS is by no means
anywhere near accurate in how often it calls things via setTimeout or
setInterval, so I'm using the actual time difference. Since this
simulation is set up to approximate the Moon's orbit around Earth, I
also apply a time multiplier to make a virtual day pass per real
second, so motion will actually be visible.

The step_universe function applies each body's velocity, scaled by the
amount of time that has passed.

Now, with this change, the Moon flies off the screen fairly
quickly. The next step will be to remedy this.

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/misterpib/puy8r/1/embedded/"></iframe>


Step 3: Adding gravity
----------------------

To keep my moon from flying off into deep space, I need to make it
respond to gravity.

Ignoring the physical and mathematical reasoning leading to the
formula, acceleration due to gravity of one body acting upon another
is as follows:

    G = 6.67428e-11
    g = -(G * M) / (r * r)

Where G is the universal gravitational constant, M is the mass of the
*attracting* object (notice how the mass of the *attracted* object
doesn't matter in this situation?), and r is the distance between the
two objects.

We need to apply this acceleration to the unit vector from the center
of the accelerator to the center of the acellerated object, as well as
scaling the acceleration by the amount of time that has passed since
the previous time slice.

Since it isn't being constantly calculated, the simulation will be a
bit inaccurate, but this is just a simulation, so that's fine.