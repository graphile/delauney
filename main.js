function init() {
  document.body.onclick = doIt;
  window.onresize = doIt;
  document.body.onresize = doIt;
  doIt();
}

function doIt() {
  const canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const cW = parseFloat(canvas.width);
  const cH = parseFloat(canvas.height);
  const ctx = canvas.getContext("2d");

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
  const colors = ["#e4ecf4", "#e5f2ff", "#deeaf5", "#dbe3ec", "#"];

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
        vertices.push([
          (point[0] + xoff) * cW,
          (point[1] + yoff) * cH,
          point[2],
          point[3]
        ]);
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
    ctx.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
    counter += Math.floor(vertices[triangles[i]][3] * 100000000);
    --i;
    ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
    counter += Math.floor(vertices[triangles[i]][3] * 100000000);
    --i;
    ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
    counter += Math.floor(vertices[triangles[i]][3] * 100000000);
    ctx.closePath();
    ctx.strokeStyle = "#fffffe";
    ctx.lineWidth = LINE_WIDTH;
    ctx.stroke();
    //ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    console.log(counter);
    ctx.fillStyle = colors[counter % colors.length];
    ctx.fill();
  }
  for (const vertex of vertices) {
    const [x, y, size] = vertex;
    ctx.strokeWidth = 0;
    ctx.fillStyle = "#fffffe";
    const radius =
      MINIMUM_DOT_SIZE +
      (MAXIMUM_DOT_SIZE - MINIMUM_DOT_SIZE) * Math.pow(Math.random(), 1.4);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
}
