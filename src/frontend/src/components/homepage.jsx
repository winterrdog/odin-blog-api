import homepagestyles from '../styles/homepage.module.css';
import Logo from './logo';
import bkgimg from '../assets/bird.png'

export default function Homepage() {
  return (
    <div className={homepagestyles.hp}>
      <header className={homepagestyles.header}>
        <Logo />
        <nav>
          <span>About</span>
          <span>Sign in</span>
          <button>Get Started</button>
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