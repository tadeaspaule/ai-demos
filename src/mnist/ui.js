import * as PIXI from 'pixi.js'

// variables for UI size (of generated pictures)
// since model is trained on 28x28 pictures, here you decide what ratio you want to use (56x56 (so 2x)? more?)
const blocks = 10
const size = 28 * blocks
const w = size, h = size


export function setup(startDrawingCallback) {
  setupDrawing(startDrawingCallback)
}

// state of the user input board
var app, g;
var board = []
for (var y = 0; y < 28; y++) {
  board.push([])
  for (var x = 0; x < 28; x++) {
    board[board.length-1].push([0.0])
  }
}
function setupDrawing (startDrawingCallback) {
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

var predElems = document.getElementById('prediction').getElementsByTagName('h4')
export function updatePredictionUI(values) {
  var counter = 0
  const maxSize = 80;
  const minVal = 0.10;
  for (const pred of predElems) {
    var v = Math.sqrt(values[counter])
    if (values[counter] < 0.02) v = 0
    else if (v < minVal) v = minVal
    pred.style.fontSize = `${v * maxSize}px`
    pred.getElementsByTagName('span')[0].textContent = `(${Math.round(values[counter] * 100)}%)`
    counter ++
  }
}
