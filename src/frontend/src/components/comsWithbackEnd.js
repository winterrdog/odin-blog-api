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

function getLogInfo() {
  let obj = {};

  if (checkIfLoggedIn()) {
    obj.name = localStorage.getItem('accname');
    console.log(obj);
  }

  return obj;
}

function clearMemory() {
  localStorage.clear();
}

export {baseURL, setLoggedIn, checkIfLoggedIn, clearMemory, getLogInfo};