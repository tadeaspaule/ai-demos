import * as PIXI from 'pixi.js'

var canvases = document.getElementsByTagName('canvas')
// console.log(canvas.getContext('2d').createImageData(100,100))
export function setup(clickGenerateCallback) {
  var generateBtn = document.getElementById('catgan-btn')
  generateBtn.addEventListener('click', clickGenerateCallback)
}

const scale = 3
// adds alpha values, scales up the image, puts into correct format
function convertPixelsArray (valuesArray, offset) {
  var arrWithAlpha = []
  for (var y = 0; y < 64 * 64 * 3; y+=64*3) {
    for (var scalefact = 0; scalefact < scale; scalefact++) {
      for (var x = 0; x < 64 * 3; x+=3) {
        for (var scalefact2 = 0; scalefact2 < scale; scalefact2++) {
          for (var j = 0; j < 3; j++) arrWithAlpha.push(valuesArray[offset+y+x+j] * 127.5 + 127.5)
          arrWithAlpha.push(255) // alpha value
        }
      }
    }
  }
  return arrWithAlpha
}
export function drawCat (valuesArray) {
  var counter = 0
  for (const canvas of canvases) {
    // hacky way to redraw the canvas content
    var arrWithAlpha = convertPixelsArray(valuesArray,counter * 64 * 64 * 3)
    counter++
    var ctx = canvas.getContext('2d')
    var palette = ctx.getImageData(0,0,64 * scale,64 * scale); //x,y,w,h
    var uintarr = new Uint8ClampedArray(arrWithAlpha)
    palette.data.set(uintarr); // assuming values 0..255, RGBA, pre-mult.
    ctx.putImageData(palette,0,0);
  }
}