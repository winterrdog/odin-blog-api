// const baseURL = 'http://localhost:3000';
const baseURL = 'https://odin-blog-api-backend.up.railway.app';

let localLikedComments;
let localLikedPosts;

window.onload = setupLS;

function setupLS() {
  (() => {
    let account = getLogInfo();
    if (!Object.keys(account).length) return null;
  
    return fetch(`${baseURL}/api/v1/post-comments/user-liked-comments`, {
      mode: 'cors',
      method: 'GET',
      credentials: 'include', // todo: test if it works
      headers: {
        'Content-type': 'application/json',
        // Authorization: `Bearer ${account.token}`,
      }
    }).then((res) => {
      if (res.status === 200) return res.json();
      else return null;
    }).then((res) => {
      let coms;
  
      if (!res) coms = [];
      else coms = res.comments.map((obj) => {return obj.id});
  
      localLikedComments = coms;
      return
    });
  })();
  
  (() => {
    let account = getLogInfo();
    if (!Object.keys(account).length) return null;
  
    return fetch(`${baseURL}/api/v1/posts/liked-posts`, {
      mode: 'cors',
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${account.token}`,
      }
    }).then((res) => {
      if (res.status === 200) return res.json();
      else return null;
    }).then((res) => {
      let posts;
  
      if (!res) posts = [];
      else posts = res.posts.map((obj) => {return obj.id});
  
      localLikedPosts = posts;
      return;
    });
  })();

}

function checkIfLoggedIn() {
  const accname = localStorage.getItem('accname');
  const initDate = localStorage.getItem('initDate');

  if (!accname || !initDate) return false;

  let setTime = new Date(initDate);
  let nowTime = new Date();

  let dif = Math.abs((nowTime - setTime) / 86400000); // difference in days (86400000 is the number of milli seconds in a day)

  if (dif < 1.9) return true; 
  else {
    localStorage.clear();
    return false;
  }
}

function setLoggedIn(str) {
  localStorage.setItem('accname', str);
  localStorage.setItem('initDate', String(new Date()));
  setupLS();
  document.body.style.backgroundColor = 'white';
}

function setUserNameOnly(str) {
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

let shortCutToSignOut = (() => {
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

function removeFromLLC(id) {
  if (!localLikedComments) return;
  let index = localLikedComments.indexOf(id);
  if (index == -1) return;
  localLikedComments.splice(index, 1);
}

function removeFromLLP(id) {
  if (!localLikedComments) return;
  let index = localLikedPosts.indexOf(id);
  if (index == -1) return;
  localLikedPosts.splice(index, 1);
}

function addToLLC(id) {
  if (!localLikedComments) return;
  if (localLikedComments.includes(id)) return;
  localLikedComments.push(id);
}

function addToLLP(id) {
  if (!localLikedComments) return;
  if (localLikedPosts.includes(id)) return;
  localLikedPosts.push(id);
}

function checkLLP(id) {
  if (!localLikedComments) return false;
  return localLikedPosts.includes(id);
}

function checkLLC(id) {
  if (!localLikedComments) return false;
  return localLikedComments.includes(id);
}

function test() {
  console.log('llc -> ', localLikedComments, '\nllp -> ', localLikedPosts );
}

export {
  baseURL, setLoggedIn, checkIfLoggedIn, clearMemory, getLogInfo, setToken, getToken, shortCutToSignIn, decodeHTML, localLikedComments, localLikedPosts,
  addToLLC, addToLLP, removeFromLLC, removeFromLLP, test, checkLLC, checkLLP, shortCutToSignOut, setUserNameOnly,
};