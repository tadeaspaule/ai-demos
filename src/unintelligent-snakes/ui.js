import * as PIXI from 'pixi.js'
import SnakeEnv from './env.js'

const canvasWidth = 400, canvasHeight = 400
const snakeContainerEl = document.getElementById('snake-container')
const snakeGameEl = document.getElementById('snake-game')
/**
 * Wrapper for the game UI
 */
class SnakeGame {
  constructor(w,h,processObservation) {
    this.env = new SnakeEnv(w,h)
    this.blockSize = canvasWidth / w
    this.pad = this.blockSize * 0.2
    this.w = w
    this.h = h
    this.processObservation = processObservation
    this.app = new PIXI.Application({
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 0x000000,
    })
    this.g = new PIXI.Graphics();
    this.app.stage.addChild(this.g);
    snakeGameEl.insertBefore(this.app.view,snakeGameEl.children[0])
    this.updateCanvas()
    this.currentAction = null
    this.waitingToExecuteAction = true
    this.processObservation(this,this.env._getObservation())
    this.app.ticker.maxFPS = 1
    this.app.ticker.add(delta => {
      if (!this.waitingToExecuteAction) {
        var res = this.env.step(this.currentAction)
        this.waitingToExecuteAction = true
        if (!res.done) {
          this.processObservation(this,res)
        }
        else {
          // game over
          this.reset()
        }
        this.updateCanvas()
      }
    })
  }
  sendAction (action) {
    this.currentAction = action
    this.waitingToExecuteAction = false
  }
  updateCanvas () {
    const half = this.blockSize / 2
    this.g.clear()
    this.g.moveTo(0,0)
    // draw food
    this.g.lineStyle(0)
    this.g.beginFill(0x66ff66,1)
    this.g.drawCircle(this.env.food_x*this.blockSize+half,this.env.food_y*this.blockSize+half,this.blockSize*0.3)
    // draw head
    const headPad = 0.1
    this.g.beginFill(0xffffff)
    this.g.drawRect((this.env.head_x+headPad)*this.blockSize,(this.env.head_y+headPad)*this.blockSize,this.blockSize*(1-headPad*2),this.blockSize*(1-headPad*2))
    // draw body
    this.g.lineStyle(this.blockSize*0.5,0xffffff)
    this.g.beginFill(0,0)
    this.g.moveTo(this.env.body[0][0]*this.blockSize+half,this.env.body[0][1]*this.blockSize+half)
    for (var i = 1; i < this.env.body.length; i++) {
      this.g.lineTo(this.env.body[i][0]*this.blockSize+half,this.env.body[i][1]*this.blockSize+half)
    }
  }
  reset () {
    this.processObservation(this,{observation: this.env.reset(), reward: 0, done: false, reset: true})
    this.updateCanvas()
  }
  setFPS (fps) {
    this.app.ticker.maxFPS = fps
  }
}

// game variable
var g = null
// index of currently selected snake model
var selected = 0
// list of all snake variants, initialized in setup
var snakeVariants = []
// UI elements
var selectionElems = [], descriptionElem = null

function updateInfoSection(newSelected) {
  g.processObservation = snakeVariants[newSelected].processObservation
  selectionElems[selected].className = 'snake-selection'
  selected = newSelected
  selectionElems[selected].className = 'snake-selection selected'
  descriptionElem.innerHTML = snakeVariants[newSelected].description
}

export function setup(w,h,variants) {
  g = new SnakeGame(w,h,variants[0].processObservation)
  snakeVariants = variants
  var infoSection = document.createElement('div')
  infoSection.className = 'fc snake-info-section'
  var selection = document.createElement('div')
  for (var i = 0; i < variants.length; i++) {
    const idx = i;
    var el = document.createElement('div')
    el.className = 'snake-selection'
    el.textContent = variants[i].name
    el.addEventListener('click', function () {
      updateInfoSection(idx)
    })
    selectionElems.push(el)
    selection.appendChild(el)
  }
  infoSection.appendChild(selection)
  descriptionElem = document.createElement('p')
  infoSection.appendChild(descriptionElem)
  snakeContainerEl.appendChild(infoSection)
  // reset button
  var resetEnvBtn = document.getElementById('snake-reset-btn')
  resetEnvBtn.addEventListener('click', function () {
    g.reset()
  })
  // speed buttons
  var speedBtns = document.getElementById('snake-env-controls').getElementsByTagName('span')
  var speeds = [1,20,60]
  for (var i = 0; i < 3; i++) {
    const idx = i
    speedBtns[i].addEventListener('click', function () {
      for (var j = 0; j < 3; j++) speedBtns[j].className = ''
      speedBtns[idx].className = 'selected'
      g.setFPS(speeds[idx])
    })
  }
  updateInfoSection(0)
}
