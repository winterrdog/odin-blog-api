const baseURL = 'http://localhost:3000';

function checkIfLoggedIn() {
  const accname = localStorage.getItem('accname');
  console.log(accname);
  if (accname) return true;
  else return false;
}

function setLoggedIn(str) {
  localStorage.setItem('accname', str);
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
    obj.name = localStorage.getItem('token');
    console.log(obj);
  }

  return obj;
}

function clearMemory() {
  localStorage.clear();
}

clearMemory();

export {baseURL, setLoggedIn, checkIfLoggedIn, clearMemory, getLogInfo, setToken, getToken};