let alert = false;

window.onbeforeunload = function() {
  return alert ? "" : null;
}

/** Set alert on unload */
function setAlerte(bool) {
  alert = bool;
}

export default setAlerte