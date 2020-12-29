import * as tf from '@tensorflow/tfjs'
import _ from 'lodash'
import * as ui from './ui.js'
import {baseSetup} from '../common.js'
baseSetup()
async function loadModel() {
  const model = await tf.loadLayersModel(`assets/catgan/model.json`);
  return model
}
let model;
loadModel().then(m => {
  model = m
  generateCatFace()
})
function generateCatFace () {
  var randomVals = []
  const nCanvases = 3
  for (var c = 0; c < nCanvases; c++) {
    randomVals.push([])
    for (var i = 0; i < 100; i++) randomVals[c].push(Math.random() * 2 - 1)
  }
  var p = model.predict(tf.tensor(randomVals))
  console.log(p)
  p.buffer().then(b => {
    console.log(b)
    ui.drawCat(b.values)
  })
}
ui.setup(generateCatFace)
