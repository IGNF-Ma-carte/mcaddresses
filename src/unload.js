let alerte = false;

window.onbeforeunload = function() {
  return alert ? "" : null;
}

/** Set alert on unload */
function setAlerte(bool) {
  alerte = bool;
}

export default setAlerte