import * as PIXI from 'pixi.js'
import * as d3 from 'd3'
const blocks = 15
const size = 28 * blocks
const w = size, h = size

var app, g;
var board = []
for (var y = 0; y < 28; y++) {
  board.push([])
  for (var x = 0; x < 28; x++) {
    board[board.length-1].push([0.0])
  }
}
export function setupDrawing (finishDrawingCallback) {
  // App with width and height of the page
  app = new PIXI.Application({
    width: w,
    height: h,
    backgroundColor: 0xffffff
  })
  g = new PIXI.Graphics();
  app.stage.addChild(g);

  var mouseDown = false
  app.renderer.plugins.interaction.on('pointerdown', function () {
    mouseDown = true
  })
  app.renderer.plugins.interaction.on('pointerup', function () {
    letGo()
    mouseDown = false
  })

  var parent = document.getElementById("pixi-parent")
  parent.style['width'] = `${w}px`
  parent.style['height'] = `${h}px`
  parent.appendChild(app.view) // Create Canvas tag in the body

  function updateDrawingArea () {
    // g.clear()
    // if (mouseDown) console.log('DDD')
    var mousePosition = app.renderer.plugins.interaction.mouse.global;
    // if (mouseDown) console.log(mousePosition)
    if (mouseDown) drawWithMouse(mousePosition.x,mousePosition.y)
  }

  function drawWithMouse(x,y) {
    g.beginFill(0x000000,1)
    var bx = Math.floor(x / blocks)
    var by = Math.floor(y / blocks)
    for (var xdif = -1; xdif < 2; xdif++) {
      for (var ydif = -1; ydif < 2; ydif++) {
        g.drawRect((bx+xdif) * blocks, (by+ydif) * blocks, blocks, blocks)
        board[by+ydif][bx+xdif][0] = 1.0
      }
    }
  }
  function letGo() {
    // var pixels = app.renderer.plugins.extract.pixels(g)
    finishDrawingCallback(board)
  }
  app.ticker.add(delta => {
    updateDrawingArea()
  })
}
export function clearDrawing () {
  g.clear()
  for (var y = 0; y < 28; y++) {
    for (var x = 0; x < 28; x++) {
      board[y][x][0] = 0.0
    }
  }
}
var margin = {top: 20, right: 80, bottom: 30, left: 50},
  width = w - margin.left - margin.right,
  height = h - margin.top - margin.bottom,
  xSelector = margin.left + width;
var dynamicLine, line;
export function setupD3 () {
  var xScale = d3.scaleLinear()
  .range([0, width]);

  var yScale = d3.scaleLinear()
  .range([height, 0]);

  var xAxis = d3.axisBottom()

  var yAxis = d3.axisLeft()

  line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d, i) { return xScale(i); })
    .y(function(d, i) { return yScale(d); });

  var svg = d3.select("#prediction").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  
  xScale.domain([0, 9]);
  yScale.domain([0,1]);
  xAxis.scale(xScale);
  yAxis.scale(yScale);

  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

  svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Value");

  dynamicLine = svg.append("path")
  .attr('class', 'line')
  .attr("d", line([0,0,0,0,0,0,0,0,0,0]))
}
export function updateLineChart(values) {
  dynamicLine
    .transition()
    .duration(750)
    .attr("d",line(values))
}
