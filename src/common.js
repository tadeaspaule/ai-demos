import pages from '../pages.json'

function siteLink(path) {
  if (window.location.href.includes('localhost')) return path
  else return `/ai-demos${path}`
}

export function baseSetup(currentPage) {
  // sets up navigation
  var navEl = document.createElement('div')
  navEl.className = 'nav'
  // add introduction navigation
  var introNav = document.createElement('h4')
  var introA = document.createElement('a')
  introA.textContent = pages[0].name
  if (currentPage == 'index') introA.className = 'current'
  introA.href = siteLink("/")
  introNav.appendChild(introA)
  navEl.appendChild(introNav)
  var categories = {}
  pages.forEach(p => {
    if (!p.category) return
    if (categories[p.category]) categories[p.category].push(p)
    else categories[p.category] = [p]
  })
  var sortedCategories = Object.keys(categories)
  sortedCategories.sort()
  sortedCategories.forEach(c => {
    var catEl = document.createElement('div')
    catEl.className = 'nav-cat'
    var catHeader = document.createElement('h4')
    catHeader.textContent = c
    catEl.appendChild(catHeader)
    categories[c].forEach(p => {
      var pageEl = document.createElement('a')
      pageEl.href = siteLink(`/${p.filename}.html`)
      if (currentPage == p.filename) pageEl.className = 'current'
      pageEl.textContent = p.name
      catEl.appendChild(pageEl)
    })
    navEl.appendChild(catEl)
  })
  document.body.appendChild(navEl)
  
  // setup navigation button in top left
  var topRightNav = document.createElement('div')
  topRightNav.className = 'nav-status fr fac'
  var i = document.createElement('i')
  i.className = 'material-icons btn'
  i.textContent = 'list'
  topRightNav.appendChild(i)
  var currentH4 = document.createElement('h4')
  currentH4.textContent = pages.find(p => p.filename == currentPage).name
  topRightNav.appendChild(currentH4)
  document.body.appendChild(topRightNav)

  // setup open/close nav behavior
  var clickCatcher = document.createElement('div')
  clickCatcher.className = 'click-catcher'
  document.body.appendChild(clickCatcher)
  i.addEventListener('click', function () {
    navEl.classList.add('shown')
    clickCatcher.classList.add('shown')
  })
  clickCatcher.addEventListener('click',function () {
    navEl.classList.remove('shown')
    clickCatcher.classList.remove('shown')
  })
}
