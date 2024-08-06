const baseURL = 'http://localhost:3000';

function checkIfLoggedIn() {
  const accname = localStorage.getItem('accname');
  if (accname) return true;
  else return false;
}

function setLoggedIn(str) {
  localStorage.setItem('accname', str);
  document.body.style.backgroundColor = 'white';
}

function setToken(str) {
  localStorage.setItem('token', str);
}

function getToken() {
  return localStorage.getItem('token');
}

function getLogInfo() {
  let obj = {};

  if (checkIfLoggedIn()) {
    obj.name = localStorage.getItem('accname');
    obj.token = localStorage.getItem('token');
  }

  return obj;
}

function clearMemory() {
  localStorage.clear();
  document.body.style.backgroundColor = 'rgb(255, 253, 241)';
}

let shortCutToSignIn = (() => {
  let cb = null;

  function setCb(callBack) {
    cb = callBack;
  }

  function callCb() {
    if (cb) cb();
  }

  return { setCb, callCb};
})();

// clearMemory();

if (checkIfLoggedIn()) document.body.style.backgroundColor = 'white';
else document.body.style.backgroundColor = 'rgb(255, 253, 241)';

function decodeHTML(encoded) {
  let tmp = document.createElement('textarea');
  tmp.innerHTML = encoded;
  return tmp.value;
}

export {baseURL, setLoggedIn, checkIfLoggedIn, clearMemory, getLogInfo, setToken, getToken, shortCutToSignIn, decodeHTML};