// Pipe to ffmpeg with something like:
// node draw.js | ffmpeg -y -c:v png -f image2pipe -r 20 -i - -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart myvideo.mp4

const { createCanvas, loadImage } = require('canvas')

var d3 = require("d3"),
    topojson = require("topojson"),
    rw = require("rw"),
    world = require("./world-110m.json");

var width = 1280,
    height = 720;

const canvas = createCanvas(width, width);

var context = canvas.getContext("2d");

var countries = topojson.feature(world, world.objects.countries),
    mesh = topojson.mesh(world, world.objects.countries);

var projection = d3.geoOrthographic()
  .scale(280)
  .translate([width / 2, height / 2])
  .clipAngle(90)
  .precision(.1);

var path = d3.geoPath()
    .projection(projection)
    .context(context);

// Draw 60 frames
d3.range(60).forEach(function(frame){

  // Spin the globe a bit more each time
  projection.rotate([frame * 6]);

  context.clearRect(width, height);

  // Water
  context.fillStyle = "#23b4d8";
  context.beginPath();
  path({type: "Sphere"});
  context.fill();

  // Countries
  countries.features.forEach(function(country){
    context.fillStyle = d3.interpolateRainbow(Math.random());
    context.beginPath();
    path(country);
    context.fill();
  });

  // Borders
  context.beginPath();
  path(mesh);
  context.stroke();

  // Pipe to stdout but squash EPIPE
  //rw.writeFileSync(process.stdout, canvas.toBuffer());
  process.stdout.write(canvas.toBuffer());

});
