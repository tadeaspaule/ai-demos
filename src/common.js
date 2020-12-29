import pages from '../pages.json'

function siteLink(path) {
  if (process.env.NODE_ENV == 'development') return path
  else return `/ai-demos${path}`
}

export function baseSetup() {
  var hrefParts = window.location.href.split('/')
  var currentPage = hrefParts[hrefParts.length-1]
  currentPage = currentPage.replace('.html','')
  if (currentPage.length == 0) currentPage = 'index'
  var pageData = pages.find(p => p.filename == currentPage)
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
  
  // set up the top bar (navigation button, name, links)

  // navigation button
  var topNav = document.createElement('div')
  topNav.className = 'nav-status fr fac'
  var navListIcon = createMaterialIcon('list','btn')
  topNav.appendChild(navListIcon)

  // setup open/close nav behavior
  var clickCatcher = document.createElement('div')
  clickCatcher.className = 'click-catcher'
  document.body.appendChild(clickCatcher)
  navListIcon.addEventListener('click', function () {
    navEl.classList.add('shown')
    clickCatcher.classList.add('shown')
    clickCatcher.style.zIndex = 1
  })
  clickCatcher.addEventListener('click',function () {
    navEl.classList.remove('shown')
    clickCatcher.classList.remove('shown')
    setTimeout(() => {
      clickCatcher.style.zIndex = -1
    }, 400);
  })

  // current page name
  var currentH2 = document.createElement('h2')
  currentH2.textContent = pageData.name
  topNav.appendChild(currentH2)

  // useful links
  if (currentPage != 'index') topNav.appendChild(createGithubLink(`https://github.com/tadeaspaule/ai-demos/tree/master/src/${pageData.filename}`,'demo code'))
  if (pageData.notebook) topNav.appendChild(createGithubLink(pageData.notebook,'ai code'))
  if (pageData.dataset) {
    var datasetIcon = createMaterialIcon('photo_library')
    datasetIcon.style.fontSize = '20px'
    topNav.appendChild(createPictureLink(pageData.dataset,'dataset',datasetIcon))
  }
  
  document.body.insertBefore(topNav,document.body.children[0])
}

function createGithubLink (href, text) {
  var githubImg = document.createElement('img')
  githubImg.src = 'assets/githubicon.png'
  githubImg.height = 16
  return createPictureLink(href,text,githubImg)
}

function createPictureLink (href, text, pictureElem) {
  var outerDiv = document.createElement('div')
  outerDiv.className = 'fr fac picturelink'
  outerDiv.appendChild(pictureElem)
  var linkTag = document.createElement('a')
  linkTag.href = href
  linkTag.textContent = text
  linkTag.target = '_blank'
  outerDiv.appendChild(linkTag)
  return outerDiv
}

function createMaterialIcon (iconName, classes) {
  if (!classes) classes = ''
  var i = document.createElement('i')
  i.textContent = iconName
  i.className = `material-icons ${classes}`
  return i
}

export function randint(min,max) {
  return Math.floor(min + Math.random() * (max-min))
}