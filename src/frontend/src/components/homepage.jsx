import homepagestyles from '../styles/homepage.module.css';
import bkgimg from '../assets/bird.png'
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Homepage() {
  const divRef = useRef();
  const navigate = useNavigate();

  return (
    <div  ref={divRef} className={homepagestyles.hp}>
      {
        <>
          <main>
            <div>Human</div>
            <div>stories &amp; ideas</div>
            <div>A place to write, read and deepen your understanding</div>
            <button onClick={() => {navigate('posts')}}>Start reading</button>
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