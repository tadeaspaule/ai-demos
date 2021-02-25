import * as tf from '@tensorflow/tfjs'
import _ from 'lodash'
import * as ui from './ui.js'
import {baseSetup} from '../common.js'

baseSetup()

// read model
async function loadModel() {
  const model = await tf.loadLayersModel(`assets/catgan/model.json`);
  return model
}
let model;
loadModel().then(m => {
  model = m
  generateCatFace()
})

// UI setup
const nCanvases = 3
function generateCatFace () {
  var randomVals = []
  for (var c = 0; c < nCanvases; c++) {
    randomVals.push([])
    for (var i = 0; i < 100; i++) randomVals[c].push(Math.random() * 2 - 1)
  }
  var p = model.predict(tf.tensor(randomVals))
  p.buffer().then(b => {
    ui.drawCat(b.values)
  })
}
ui.setup(generateCatFace)
