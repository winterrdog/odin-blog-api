const baseURL = 'http://localhost:3000';

function checkIfLoggedIn() {
  const accname = localStorage.getItem('accname');
  const initDate = localStorage.getItem('initDate');

  if (!accname || !initDate) return false;

  let setTime = new Date(initDate);
  let nowTime = new Date();

  let dif = Math.abs((nowTime - setTime) / 86400000); // difference in days (86400000 is the number of milli seconds in a day)

  if (dif < 1.9) return true; // todo:: handle if new setting of expiry date of token
  else {
    localStorage.clear();
    return false;
  }
}

function setLoggedIn(str) {
  localStorage.setItem('accname', str);
  localStorage.setItem('initDate', String(new Date()));
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