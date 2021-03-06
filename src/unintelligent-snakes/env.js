import {randint} from '../common.js'

export default class SnakeEnv {
  constructor(map_width,map_height,food_reward=1,base_reward=0,dead_reward=-1) {
    // initialize global constants
    this._observation_directions = [
      [-1,-1],[0,-1],[1,-1],[1,0],
      [1,1],[0,1],[-1,1],[-1,0]
    ]
    this.ACTION_SPACE_SIZE = 4
    this.OBSERVATION_SPACE_VALUES = 24
    this.map_width = map_width
    this.map_height = map_height
    // initialize 2d board representation
    this.map = []
    for (var x = 0; x < map_width; x++) {
      this.map.push([])
      for (var y = 0; y < map_height; y++) {
        this.map[this.map.length-1].push(0)
      }
    }
    // initialize rewards
    this._DEAD_REWARD = dead_reward
    this._FOOD_REWARD = food_reward
    this._BASE_REWARD = base_reward
    // run setup, for body, food, etc
    this.reset()
  }

  /**
   * Returns a deep copy of this environment
   */
  clone () {
    var cloneEnv = new SnakeEnv(this.map_width,this.map_height,this._FOOD_REWARD,this._BASE_REWARD,this._DEAD_REWARD)
    for (var x = 0; x < this.map_width; x++) {
      for (var y = 0; y < this.map_height; y++) {
        cloneEnv.map[x][y] = this.map[x][y]
      }
    }
    cloneEnv.head_x = this.head_x
    cloneEnv.head_y = this.head_y
    cloneEnv.body = []
    for (var i = 0; i < this.body.length; i++) {
      cloneEnv.body.push([this.body[i][0],this.body[i][1]])
    }
    return cloneEnv
  }

  /**
   * Returns [x,y] coordinates for a free tile on the map
   * If no tiles are free, throws an Exception
   */
  _getFreePos() {
    var x = randint(0,this.map_width), y = randint(0,this.map_height)
    var origx = x, origy = y
    while (this.map[x][y] != 0) {
      x += 1
      if (x == this.map_width) {
        x = 0
        y += 1
        if (y == this.map_height) y = 0
      }
      if (x == origx && y == origy) throw new Exception('no free space')
    }
    return [x,y]
  }

  /**
   * Generates food on a free tile of the board
   */
  _generateFood() {
    var freePos = this._getFreePos()
    this.food_x = freePos[0]
    this.food_y = freePos[1]
    this.map[this.food_x][this.food_y] = 2
  }

 /**
  * Get an observation vector of the current state
  * Format: array of size 24. It's effectively 3 groups of 8
  * #1 8 is distances to the walls
  * #2 8 is distances to the body
  * #3 8 is distances to food
  * order in each 8 is NW,N,NE,E,SE,S,SW,W (using cardinal directions)
  * lowest value is 1 (so obs[1] == 1 if a wall is right above you)
  * this observation structure was inspired by Code Bullet
  * https://www.youtube.com/c/CodeBullet
  * @returns {Object} observation vector
  */
  _getObservation() {
    var obs = []
    for (var o = 0; o < 24; o++) obs.push(0)
    var xdif = this.map_width-this.head_x-1
    var ydif = this.map_height-this.head_y-1
    obs[0] = Math.min(this.head_x,this.head_y) + 1;      // top left
    obs[1] = this.head_y + 1;                             // top
    obs[2] = Math.min(xdif,this.head_y) + 1;   // top right
    obs[3] = xdif + 1;          // right
    obs[4] = Math.min(xdif,ydif) + 1;// bottom right
    obs[5] = ydif + 1;          // bottom
    obs[6] = Math.min(this.head_x,ydif) + 1;   // bottom left
    obs[7] = this.head_x + 1;             // left
    // +1 so that when you're right next to it, it's a 1 not a 0
    for (var i = 0; i < 8; i++) {
      var x = this.head_x + this._observation_directions[i][0]
      var y = this.head_y + this._observation_directions[i][1]
      var foundFood = false
      var foundBody = false
      var counter = 1
      while (x >= 0 && x < this.map_width && y >= 0 && y < this.map_height && !(foundFood && foundBody)) {
        if (!foundBody && this.map[x][y] == 1) {
          obs[8+i] = counter
          foundBody = true
        }
        else if (!foundFood && this.map[x][y] == 2) {
          obs[16+i] = counter
          foundFood = true
        }
        counter += 1
        x += this._observation_directions[i][0]
        y += this._observation_directions[i][1]
      }
    }
    return obs
  }

  /**
   * Take an action in the environment and alter it by doing so
   * @param {Number} action - 0: up, 1: right, 2: down, 3: left
   * @param {*} returnObservation - whether to calculate and return an observation vector
   * @returns {Object} object with observation, reward, and done fields
   */
  step(action, returnObservation = true) {
    this._lastAction = action
    var reward;
    if (action == 0) reward = this._move(0,-1)
    else if (action == 1) reward = this._move(1,0)
    else if (action == 2) reward = this._move(0,1)
    else reward = this._move(-1,0)
    var observation = returnObservation ? this._getObservation() : null
    return {
      observation,
      reward,
      done: reward == this._DEAD_REWARD || this.body.length + 1 >= this.map_width * this.map_height
    }
  }

  /**
   * Helper method for movement
   * Handles collisions & food eating
   * @param {Number} vx - Change in x direction
   * @param {Number} vy - Change in y direction
   * @returns {Number} reward for reaching the new state
   */
  _move(vx,vy) {
    if (this.head_x+vx < 0 || this.head_x+vx >= this.map_width) return this._DEAD_REWARD
    if (this.head_y+vy < 0 || this.head_y+vy >= this.map_height) return this._DEAD_REWARD
    if (this.map[this.head_x+vx][this.head_y+vy] == 1) return this._DEAD_REWARD
    if (this.map[this.head_x+vx][this.head_y+vy] == 2) {
      this._moveto(this.head_x+vx,this.head_y+vy,false)
      if (this.body.length + 1 < this.map_width * this.map_height) this._generateFood()
      return this._FOOD_REWARD
    }
    this._moveto(this.head_x+vx,this.head_y+vy)
    return this._BASE_REWARD
  }

  /**
   * Helper method for moving to a specific tile
   * @param {Number} x - New x position of head
   * @param {Number} y - New y position of head
   * @param {Boolean} pop_tail - Whether to pop the tail position
   */
  _moveto(x,y,pop_tail=true) {
    this.head_x = x
    this.head_y = y
    this.body.unshift([x,y])
    this.map[x][y] = 1
    if (pop_tail) {
      var tail = this.body.pop()
      var tailx = tail[0], taily = tail[1]
      this.map[tailx][taily] = 0
    }
  }

  /**
   * Reset & re-initialization method
   * - clears the board (sets to 0s)
   * - initializes a 1-length snake in a random position
   * - generates food
   * @returns observation vector
   */
  reset() {
    for (var x = 0; x < this.map_width; x++) {
      for (var y = 0; y < this.map_height; y++) {
        this.map[x][y] = 0
      }
    }
    this.head_x = Math.floor(this.map_width / 2)
    this.head_y = Math.floor(this.map_height / 2)
    this._lastAction = -10 // since using abs() == 2 check below, if initialised to 0 or -1 it would discriminate first move
    this.body = []
    this.body.push([this.head_x,this.head_y])
    this.map[this.head_x][this.head_y] = 1
    this._generateFood()
    return this._getObservation()
  }

  /**
   * Generates possible successor environments (states) for each available action
   * Ignores successors where the snake dies
   * @param {Boolean} returnObservation - whether to set .obs field with an observation vector for each successor
   * @returns Array of {env,obs,reward,done} objects
   */
  getSuccessors(returnObservation = false) {
    var successors = {}
    for (var i = 0; i < 4; i++) {
      if (Math.abs(i-this._lastAction) == 2) continue // don't go back to previous state, prunes search space
      successors[i] = {env: this.clone()}
      var res = successors[i].env.step(i,returnObservation)
      if (res.done) { // don't return "dead" successors
        delete successors[i]
        continue
      }
      if (returnObservation) successors[i].obs = res.observation
      successors[i].reward = res.reward
      successors[i].done = res.done
    }
    return successors
  }
}