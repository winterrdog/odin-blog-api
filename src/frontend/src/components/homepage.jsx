import homepagestyles from '../styles/homepage.module.css';
import Logo from './logo';
import bkgimg from '../assets/bird.png'
import Signinup from './sign-in-up';
import { useState } from 'react';

export default function Homepage() {
  const [showDialog, setShowDialog] = useState(false);
  const [source, setSource] = useState('');

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

  return (
    <div className={homepagestyles.hp}>

      {
        showDialog ? 
        (
          <>
            <div className={homepagestyles.dialoghelp}></div>
            <div className={homepagestyles.signinup}>
              <Signinup source={source} handleClose={handleClose} />
            </div>
          </>
        )
        :
        null
      }
      
      <header className={homepagestyles.header}>
        <Logo />
        <nav>
          <span>About</span>
          <span onClick={handleSignIn}>Sign in</span>
          <button onClick={handleGetStarted}>Get Started</button>
        </nav>
      </header>
      <div className={homepagestyles.art}>
        <div className={homepagestyles.messageboard}>This message can be anything!</div>
      </div>
      
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
    </div>
  );
}