function isMobileByWidth() {
  return window.innerWidth <= 480;
}

if (!isMobileByWidth()) {
  document.body.innerHTML = "<h1>Bitte öffne diese Website nur auf deinem Handy.</h1>";
}
