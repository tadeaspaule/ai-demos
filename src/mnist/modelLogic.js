import * as tf from '@tensorflow/tfjs'
import _ from 'lodash'
import * as ui from './ui.js'
import {baseSetup} from '../common.js'
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
  var p = model.predict(tf.tensor([board]))
  p.buffer().then(b => {
    ui.updatePredictionUI(b.values)
    setTimeout(() => {
      ui.clearDrawing()
    }, 700);
  })
}
var debouncedPrediction = _.debounce(showPrediction,600)

ui.setup(debouncedPrediction)