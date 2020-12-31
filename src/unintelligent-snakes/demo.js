import {baseSetup,randint} from '../common.js'
import * as ui from './ui.js'
baseSetup()

const NBFSmaxDepth = 6;
function naiveBFS (game,stepResult) {
  var succ = game.env.getSuccessors()
  var expanded = []
  for (var si = 0; si < 4; si++) {
    if (succ[si]) expanded.push({state: succ[si], move: si})
  }
  var counter = 0
  var startAt = 0
  var chosenAction = -1
  while (counter < NBFSmaxDepth && chosenAction == -1 && startAt < expanded.length) {
    var endAt = expanded.length
    for (var i = startAt; i < endAt; i++) {
      if (expanded[i].state.reward == 1) {
        chosenAction = expanded[i].move
        break
      }
    }
    if (chosenAction != -1) break
    var foundInNewExpanded = false
    for (i = startAt; i < endAt; i++) {
      if (expanded[i].state.reward == -1) continue
      var newExpanded = expanded[i].state.env.getSuccessors()
      for (var j = 0; j < 4; j++) {
        if (!newExpanded[j]) continue
        if (newExpanded[j].reward == 1) {
          foundInNewExpanded = true
          chosenAction = expanded[i].move
          break
        }
        expanded.push({state: newExpanded[j], move: expanded[i].move})
      }
      if (foundInNewExpanded) break
    }
    startAt = endAt
    counter++
  }
  if (chosenAction == -1) {
    var valid = []
    for (var i = 0; i < 4; i++) {
      if (succ[i] && succ[i].reward > -1) {
        valid.push(i)
      }
    }
    chosenAction = valid[randint(0,valid.length)]
  }
  game.sendAction(chosenAction)
}
// cautious searcher
var csTree = null
var csPath = [] // set path, whether to food, or 1 element decision for next step. in reverse (i.e. [0,1] means do 1 THEN 0)
const csTreeHeight = 9
const csPostSafetySearch = 9 // after x turns post-food, still possible to be alive (prevents dead-ends)
function sgExpandTree (tree, depth) {
  if (depth == 0) return
  tree.expanded = true
  var succ = tree.env.getSuccessors()
  for (var i = 0; i < 4; i++) {
    if (succ[i]) {
      const cI = i
      tree[i] = {env: succ[i].env, safeFood: succ[i].reward == 1, parent: tree, action: cI, expanded: false}
      sgExpandTree(tree[i],depth-1)
    }
  }
}
// TODO this could be done dynamically when creating new nodes in the tree
function csGetChildrenCount (tree) {
  if (!tree.expanded) return 1
  var childCount = 0
  for (var i = 0; i < 4; i++) {
    if (tree[i]) childCount += csGetChildrenCount(tree[i])
  }
  return childCount
}
function csExpandLeaves(tree,upToHeight) {
  if (upToHeight == 0) return
  if (!tree.expanded) {
    sgExpandTree(tree,upToHeight)
    return
  }
  for (var i = 0; i < 4; i++) if (tree[i]) csExpandLeaves(tree[i],upToHeight-1)
}
function csHasReachableStates (tree, depth) {
  if (!tree.expanded) sgExpandTree(tree,depth)
  if (depth == 0) {
    if (!tree.expanded) return true
    for (var i = 0; i < 4; i++) if (tree[i]) return true
  }
  for (var i = 0; i < 4; i++) {
    if (tree[i] && csHasReachableStates(tree[i],depth-1)) return true
  }
  return false
}
function cs (game,stepResult) {
  if (stepResult.reward == 1) {
    // IMPORTANT part, since post-food tree nodes rely on differently placed new foods
    csPath = []
    csTree = null
  }
  // if have a decided path, pursue it
  if (csPath.length > 0) {
    game.sendAction(csPath.pop())
    return
  }
  // otherwise try to compute it
  // initialise tree if not initialised / restarting
  if (stepResult.reset) csTree = null
  if (csTree == null) {
    csTree = {env: game.env, safeFood: false, parent: null, action: null}
    sgExpandTree(csTree,csTreeHeight)
  }
  // try to find food with BFS
  var nodesToCheck = [csTree]
  for (var d = 0; d < csTreeHeight; d++) {
    var foundFoodPath = false
    for (var i = 0; i < nodesToCheck.length; i++) {
      if (nodesToCheck[i].safeFood) {
        // found food
        // first check if safe food
        if (csHasReachableStates(nodesToCheck[i],csPostSafetySearch)) {
          // setup path using .parent and .action
          var t = nodesToCheck[i]
          while (t.parent) {
            csPath.push(t.action)
            t = t.parent
          }
          foundFoodPath = true
          break
        }
        else nodesToCheck[i].safeFood = false // so don't expand this state in subsequent searches
      }
    }
    if (foundFoodPath) break
    var newNodesToCheck = []
    for (var i = 0; i < nodesToCheck.length; i++) {
      for (var a = 0; a < 4; a++) if (nodesToCheck[i][a]) newNodesToCheck.push(nodesToCheck[i][a])
    }
    nodesToCheck = newNodesToCheck
  }
  // if no food path, just take one-element path to safest state (defined as having largest subtree)
  if (csPath.length == 0) {
    var maxAt = 0, maxChildCount = 0
    for (var i = 0; i < 4; i++) {
      if (!csTree[i]) continue
      var childCount = csGetChildrenCount(csTree[i])
      if (childCount >= maxChildCount) {
        maxAt = i
        maxChildCount = childCount
      }
    }
    csPath = [maxAt]
  }
  // once path is found, update csTree (new root is end of path)
  for (var i = csPath.length-1; i >= 0; i--) {
    if (csTree[csPath[i]]) {
      csTree = csTree[csPath[i]]
      delete csTree.parent
    }
    else {
      csTree = null
      game.sendAction(0)
      return
    }
  }
  csExpandLeaves(csTree,csTreeHeight)
  game.sendAction(csPath.pop())
}
/*
0 -> get to top left corner
1 -> zig zag to the bottom
2 -> go back up
*/
var optimalPhase = 0
function slowOptimal (game,stepResult) {
  if (stepResult.reset) optimalPhase = 0
  if (optimalPhase == 0) {
    // hasn't started optimal loop yet
    if (game.env.head_x > 0) game.sendAction(3)
    else if (game.env.head_y > 0) game.sendAction(0)
    else {
      optimalPhase++
      game.sendAction(1)
    }
  }
  else if (optimalPhase == 1) {
    if ((game.env.head_x == 1 && game.env.head_y % 2 && game.env.head_y + 1 < game.env.map_height) || (game.env.head_x + 1 == game.env.map_width && game.env.head_y % 2 == 0)) {
      game.sendAction(2)
    }
    else if (game.env.head_y % 2 == 0) game.sendAction(1)
    else {
      game.sendAction(3)
      if (game.env.head_x == 1 && game.env.head_y + 1 >= game.env.map_height) {
        optimalPhase++
      }
    }
  }
  else if (optimalPhase == 2) {
    if (game.env.head_x > 0) game.sendAction(3)
    else game.sendAction(0)
    if (game.env.head_y == 1) optimalPhase = 1
  }
}

var variants = [
  {
    name: "Naive searcher",
    description: 
      `If there is food within ${NBFSmaxDepth} steps, goes for it with the shortest possible path. (uses breadth-first search)
      <br><br>
      Notice for example that it tends to die in "dead ends", i.e. it chased the food in such a way that it then can't avoid hitting its own body.
      Had it been smarter, it would've realised that it has to wait a bit for its body to move out of the way`,
    processObservation: naiveBFS
  },
  {
    name: "Cautious searcher",
    description:
      `Using BFS, looks for food reachable within ${csTreeHeight} steps.
      It's cautious because it then validates these food paths by looking forward ${csPostSafetySearch} more steps (branchings of the state space).
      If there are any reachable states left, goes for the food. Otherwise, looks for a different path.
      <br>
      If no reachable and safe food is found, does the action that results in the most flexible search space; meaning how many reachable states in depth ${csTreeHeight}. This for example helps avoid dead ends
      <br><br>
      These considerations are done by first constructing a search tree of possible states of height ${csTreeHeight}, then searching, updating and pruning this tree as necessary.
      In short, you don't repeatedly generate the same possible states. 
      `,
    processObservation: cs
  },
  {
    name: "Slow-optimal",
    description: 
    `Always manages to win by following a pre-set path.
    <br><br>
    As the name suggests, the downside is that this is extremely slow. There are workarounds and shortcuts you can use to improve this algorithm, and I might come back to do that.
    <br><br>
    Another interesting thing to note is that approaches like this rely on at least one side (width or height) of the environment to be even.
    You can read more about it in <a href="https://gamedev.stackexchange.com/questions/133460/how-to-find-a-safe-path-for-an-ai-snake" target="_blank">this StackOverflow question</a>.
    (hint: it has to do with Hamiltonian cycles)`,
    processObservation: slowOptimal
  }
]

ui.setup(6,6,variants)
