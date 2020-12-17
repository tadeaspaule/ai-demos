import * as PIXI from 'pixi.js'
import * as d3 from 'd3'
const blocks = 10
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
export function setup(startDrawingCallback) {
  setupDrawing(startDrawingCallback)
  setupD3()
}
function setupDrawing (startDrawingCallback) {
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
    startDrawingCallback.cancel()
    mouseDown = true
  })
  app.renderer.plugins.interaction.on('pointerup', function () {
    startDrawingCallback(board)
    mouseDown = false
  })

  var parent = document.getElementById("pixi-parent")
  parent.style['width'] = `${w}px`
  parent.style['height'] = `${h}px`
  parent.insertBefore(app.view,parent.children[0]) // Create Canvas tag in the body

  function updateDrawingArea () {
    if (!mouseDown) return
    var mousePosition = app.renderer.plugins.interaction.mouse.global;
    drawWithMouse(mousePosition.x,mousePosition.y)
  }
  function drawWithMouse(x,y) {
    g.beginFill(0x000000,1)
    var bx = Math.floor(x / blocks)
    var by = Math.floor(y / blocks)
    for (var xdif = -1; xdif < 2; xdif++) {
      for (var ydif = -1; ydif < 2; ydif++) {
        if (bx+xdif < 0 || bx+xdif > 27) continue
        if (by+ydif < 0 || by+ydif > 27) continue
        g.drawRect((bx+xdif) * blocks, (by+ydif) * blocks, blocks, blocks)
        board[by+ydif][bx+xdif][0] = 1.0
      }
    }
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
var margin = {top: 30, right: 30, bottom: 30, left: 50},
  width = w * 2 - margin.left - margin.right,
  height = h - margin.top - margin.bottom,
  xSelector = margin.left + width;
var dynamicLine, line;
function setupD3 () {
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

  svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .text("Prediction");
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
