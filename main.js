// const colors = ["#e4ecf4", "#e5f2ff", "#deeaf5", "#dbe3ec"];
const colors = [
  "#e4ecf4",
  "#e5f2ff",
  "#deeaf5",
  "#e4ecf4",
  "#e5f2ff",
  "#deeaf5",
  "#dbe3ec"
];
const xmlns = "http://www.w3.org/2000/svg";
const svgW = 1000;
const svgH = 1000;
let svg;
let canvas;
let downloadLink;
function init() {
  svg = document.getElementById("svg");
  canvas = document.getElementById("canvas");
  downloadLink = document.getElementById("a");
  svg.onclick = doIt;
  canvas.onclick = doIt;
  window.onresize = doIt;
  document.body.onresize = doIt;
  doIt();
}

function doIt() {
  const cW = window.innerWidth;
  const cH = window.innerHeight;
  canvas.width = cW;
  canvas.height = cH;
  const ctx = canvas.getContext("2d");

  const svgTriangles = svg.getElementsByClassName("triangles")[0];
  let fc;
  while ((fc = svgTriangles.firstChild)) {
    svgTriangles.removeChild(fc);
  }
  const svgCircles = svg.getElementsByClassName("circles")[0];
  while ((fc = svgCircles.firstChild)) {
    svgCircles.removeChild(fc);
  }

  const s = window.location.search;
  let config = {
    dots: 50,
    min_size: cW / 128,
    max_size: cW / 64,
    line_width: cW / 720
  };

  if (s) {
    const a = s.replace(/^\?/, "");
    const b = a.split("&");
    const o = b.reduce((memo, part) => {
      const [key, value] = part.split("=");
      memo[key] = parseFloat(value);
      return memo;
    }, config);
  }
  const LINE_WIDTH = config.line_width;
  const MINIMUM_DOT_SIZE = config.min_size;
  const MAXIMUM_DOT_SIZE = config.max_size;
  const NUMBER_OF_DOTS = config.dots;

  const points = [];
  /*
  for (let i = 0; i < 100; i++) {
    points.push([Math.random(), Math.random()]);
  }
  */
  const minDistance = (MAXIMUM_DOT_SIZE / cW) * 2 * 1.2;
  const minDistanceSquared = minDistance * minDistance;
  function isTooClose(x, y) {
    for (const point of points) {
      const distSquared = Math.pow(point[0] - x, 2) + Math.pow(point[1] - y, 2);
      if (distSquared < minDistanceSquared) return true;
    }
    return false;
  }
  for (let i = NUMBER_OF_DOTS; i--; ) {
    let x, y;
    let attempts = 0;
    do {
      do {
        x = Math.random() - 0.5;
        y = Math.random() - 0.5;
      } while (x * x >= 0.25 || y * y >= 0.25);
      x = x + 0.5;
      y = y + 0.5;
    } while (isTooClose(x, y) && attempts++ < 50);
    points.push([x, y, Math.random(), Math.random()]);
  }

  const vertices = [];
  for (let xoff = -1; xoff <= 1; xoff++) {
    for (let yoff = -1; yoff <= 1; yoff++) {
      for (const point of points) {
        vertices.push([point[0] + xoff, point[1] + yoff, point[2], point[3]]);
      }
    }
  }

  console.time("triangulate");
  var triangles = Delaunay.triangulate(vertices);
  console.timeEnd("triangulate");
  for (let i = triangles.length; i; ) {
    let counter = 0;
    ctx.beginPath();
    --i;
    const [x1, y1, , r1] = vertices[triangles[i]];
    ctx.moveTo(x1 * cW, y1 * cH);
    counter += Math.floor(r1 * 100000000);
    --i;
    const [x2, y2, , r2] = vertices[triangles[i]];
    ctx.lineTo(x2 * cW, y2 * cH);
    counter += Math.floor(r2 * 100000000);
    --i;
    const [x3, y3, , r3] = vertices[triangles[i]];
    ctx.lineTo(x3 * cW, y3 * cH);
    counter += Math.floor(r3 * 100000000);
    ctx.closePath();
    ctx.strokeStyle = "#fffffe";
    ctx.lineWidth = LINE_WIDTH;
    ctx.stroke();
    //ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    console.log(counter);
    ctx.fillStyle = colors[counter % colors.length];
    ctx.fill();

    const p = document.createElementNS(xmlns, "polygon");
    p.setAttributeNS(
      null,
      "points",
      `${x1 * svgW},${y1 * svgH} ${x2 * svgW},${y2 * svgH} ${x3 * svgW},${y3 *
        svgH}`
    );
    p.setAttributeNS(null, "fill", colors[counter % colors.length]);
    p.setAttributeNS(null, "stroke", "white");
    svgTriangles.appendChild(p);
  }
  for (const vertex of vertices) {
    const [x, y, size] = vertex;
    ctx.strokeWidth = 0;
    ctx.fillStyle = "#fffffe";
    const radius =
      MINIMUM_DOT_SIZE +
      (MAXIMUM_DOT_SIZE - MINIMUM_DOT_SIZE) * Math.pow(Math.random(), 1.4);
    ctx.beginPath();
    ctx.arc(x * cW, y * cH, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    const circle = document.createElementNS(xmlns, "circle");
    circle.setAttributeNS(null, "cx", x * svgW);
    circle.setAttributeNS(null, "cy", y * svgH);
    circle.setAttributeNS(null, "r", (radius * svgW) / cW);
    circle.setAttributeNS(null, "fill", "white");
    svgCircles.appendChild(circle);
  }

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
  var svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  var svgUrl = URL.createObjectURL(svgBlob);
  downloadLink.href = svgUrl;
  downloadLink.download = "graphile-delaunay.svg";
}

function exportSVG() {}
