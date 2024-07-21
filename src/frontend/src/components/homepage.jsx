import homepagestyles from '../styles/homepage.module.css';
import Logo from './logo';
import bkgimg from '../assets/bird.png'
import Signinup from './sign-in-up';
import { useEffect, useState } from 'react';
import { baseURL } from './comsWithbackEnd';

export default function Homepage() {
  const [showDialog, setShowDialog] = useState(false);
  const [source, setSource] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [account, setAccount] = useState({});

  function handleGetStarted() {
    setSource('up');
    setShowDialog(true);
  }

  function handleClose() {
    setShowDialog(false);
  }

  function handleSignIn() {
    setSource('in');
    setShowDialog(true);
  }

  function login(obj) {
    setIsSignedIn(true);
    setAccount(obj);
  }

  useEffect(() => {
    if (!isSignedIn) return;

    fetch(`${baseURL}/api/v1/posts/`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
      }
    }).then((response) => {
      return response.json();
    }).then((response) => {
      console.log(response);
    }).catch((err) => {
      console.error(err);
    });

    return () => {

    }
  }, [isSignedIn]);

  return (
    <div className={isSignedIn ? homepagestyles.SIhp : homepagestyles.hp}>

      {
        showDialog ? 
        (
          <>
            <div className={homepagestyles.dialoghelp}></div>
            <div className={homepagestyles.signinup}>
              <Signinup source={source} handleClose={handleClose} login={login} />
            </div>
          </>
        )
        :
        null
      }
      
      <header className={isSignedIn ? homepagestyles.SIheader : homepagestyles.header}>
        <Logo />
        {
          isSignedIn ? 
          <>
            <nav>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="Write">
                  <path fill="currentColor" d="M14 4a.5.5 0 0 0 0-1zm7 6a.5.5 0 0 0-1 0zm-7-7H4v1h10zM3 4v16h1V4zm1 17h16v-1H4zm17-1V10h-1v10zm-1 1a1 1 0 0 0 1-1h-1zM3 20a1 1 0 0 0 1 1v-1zM4 3a1 1 0 0 0-1 1h1z"></path>
                  <path stroke="currentColor" d="m17.5 4.5-8.458 8.458a.25.25 0 0 0-.06.098l-.824 2.47a.25.25 0 0 0 .316.316l2.47-.823a.25.25 0 0 0 .098-.06L19.5 6.5m-2-2 2.323-2.323a.25.25 0 0 1 .354 0l1.646 1.646a.25.25 0 0 1 0 .354L19.5 6.5m-2-2 2 2"></path>
                </svg>
                <span>Write</span>
              </span>
              <div className={homepagestyles.account}>{account.name[0]}</div>
            </nav>
          </>
          :
          <>
            <nav>
              <span>About</span>
              <span onClick={handleSignIn}>Sign in</span>
              <button onClick={handleGetStarted}>Get Started</button>
            </nav>  
          </>
        }
      </header>

      <div className={homepagestyles.art}>
        <div className={homepagestyles.messageboard}>This message can be anything!</div>
      </div>
      
      {
        isSignedIn ? 
        <>

        </>
        :
        <>
          <main>
            <div>Human</div>
            <div>stories &amp; ideas</div>
            <div>A place to write, read and deepen your understanding</div>
            <button>Start reading</button>
            <img src={bkgimg} alt="bird painting" />
          </main>
          <div className={homepagestyles.bottomborder}></div>
          <footer className={homepagestyles.footer}>
            <a href="https://github.com/muchubatactics">muchubatactics</a>
            <a href="https://github.com/winterrdog">winterrdog</a>
          </footer>
        </>
      }

    </div>
  );
}