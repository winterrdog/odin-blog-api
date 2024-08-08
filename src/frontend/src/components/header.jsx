import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import styles from '../styles/header.module.css';

import Logo from './logo';
import Signinup from './sign-in-up';

import { checkIfLoggedIn, getLogInfo, setLoggedIn, shortCutToSignIn, shortCutToSignOut } from './comsWithbackEnd';
import ProfileDiv from './profilediv';

export default function Header() {
  const [showDialog, setShowDialog] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(checkIfLoggedIn());
  const [source, setSource] = useState('');
  const [account, setAccount] = useState(getLogInfo());
  const accountRef = useRef();


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
    setLoggedIn(obj.name);
  }

  shortCutToSignIn.setCb(() => {setShowDialog(true)});
  shortCutToSignOut.setCb(() => {setIsSignedIn(false)});

  return (
    <div className={isSignedIn ? styles.nocolor : styles.yescolor }>
      {
        <>
          {
            showDialog ? 
            (
              <>
                <div className={styles.dialoghelp}></div>
                <div className={styles.signinup}>
                  <Signinup source={source} handleClose={handleClose} login={login} />
                </div>
              </>
            )
            :
            null
          }
        
          
          <header className={isSignedIn ? styles.SIheader : styles.header}>
            <Logo />
            {
              isSignedIn ? 
              <>
                <nav>
                  <span><Link to='/posts'>All posts</Link></span>
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="Write">
                      <path fill="currentColor" d="M14 4a.5.5 0 0 0 0-1zm7 6a.5.5 0 0 0-1 0zm-7-7H4v1h10zM3 4v16h1V4zm1 17h16v-1H4zm17-1V10h-1v10zm-1 1a1 1 0 0 0 1-1h-1zM3 20a1 1 0 0 0 1 1v-1zM4 3a1 1 0 0 0-1 1h1z"></path>
                      <path stroke="currentColor" d="m17.5 4.5-8.458 8.458a.25.25 0 0 0-.06.098l-.824 2.47a.25.25 0 0 0 .316.316l2.47-.823a.25.25 0 0 0 .098-.06L19.5 6.5m-2-2 2.323-2.323a.25.25 0 0 1 .354 0l1.646 1.646a.25.25 0 0 1 0 .354L19.5 6.5m-2-2 2 2"></path>
                    </svg>
                    <span><Link to='/write'>Write</Link></span>
                  </span>
                  <div className={styles.account} ref={accountRef}>
                    {account.name[0]}
                    <ProfileDiv cb={setIsSignedIn} parentRef={accountRef}/>
                  </div>
                </nav>
              </>
              :
              <>
                <nav>
                  <span><Link to='/about'>About</Link></span>
                  <span onClick={handleSignIn}>Sign in</span>
                  <button onClick={handleGetStarted}>Get Started</button>
                </nav>  
              </>
            }
          </header>

          <div className={styles.art} style={isSignedIn ? {border: 0} : {}}>
            <div className={styles.messageboard}>This message can be anything!</div>
          </div>
        </>
      }
    </div>
  );
}