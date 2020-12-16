import * as tf from '@tensorflow/tfjs'
import * as ui from './ui.js'

async function loadModel() {
  const model = await tf.loadLayersModel(`assets/classifier-model/model.json`);
  return model
}
let model;
loadModel().then(m => {
  model = m
  console.log(model)
  // model.predict()
})
ui.setupD3()
ui.setupDrawing(function (board) {
  var p = model.predict(tf.tensor([board]))
  p.print()
  p.buffer().then(b => {
    // b.values !!
    ui.updateLineChart(b.values)
    var maxI = 0
    for (var i = 1; i < b.values.length; i++) {
      if (b.values[i] > b.values[maxI]) maxI = i
    }
    console.log(maxI)
    setTimeout(() => {
      ui.clearDrawing()
    }, 500);
  })
  var downscaled = []
  // for (var x = )
})
