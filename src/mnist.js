import * as tf from '@tensorflow/tfjs'
import _ from 'lodash'
import * as ui from './mnistui.js'
import {baseSetup} from './common.js'
baseSetup('mnist')
async function loadModel() {
  const model = await tf.loadLayersModel(`assets/classifier-model/model.json`);
  return model
}
let model;
loadModel().then(m => {
  model = m
})
function showPrediction(board) {
  console.log("pstart")
  var p = model.predict(tf.tensor([board]))
  console.log("pstart2")
  // p.print()
  p.buffer().then(b => {
    console.log("pend")
    ui.updateLineChart(b.values)
    var maxI = 0
    for (var i = 1; i < b.values.length; i++) {
      if (b.values[i] > b.values[maxI]) maxI = i
    }
    console.log(maxI)
    setTimeout(() => {
      ui.clearDrawing()
    }, 700);
  })
}
var debouncedPrediction = _.debounce(showPrediction,600)

ui.setup(debouncedPrediction)