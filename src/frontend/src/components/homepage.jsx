import homepagestyles from '../styles/homepage.module.css';
import Logo from './logo';
import bkgimg from '../assets/bird.png'
import Signinup from './sign-in-up';
import { useEffect, useState } from 'react';
import { baseURL, checkIfLoggedIn, setLoggedIn, getLogInfo } from './comsWithbackEnd';
import About from './about';
import { Link, useNavigate } from 'react-router-dom';

export default function Homepage() {
  const [showDialog, setShowDialog] = useState(false);
  const [source, setSource] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(checkIfLoggedIn());
  const [account, setAccount] = useState(getLogInfo());
  const [isOnAbout, setIsOnAbout] = useState(false);
  const [posts, setPosts] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!isSignedIn) return; // could also load the posts immediately instead of waiting for log in // although, it's not necessary

    fetch(`${baseURL}/api/v1/posts/`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
      }
    }).then((response) => {
      return response.json();
    }).then((response) => {

      if (response.message !== 'Posts retrieved successfully') setPosts({error: true});
      
      let temp = response.posts.map((obj) => {
        return {
          author: obj.author,
          title: obj.title,
          dateCreated: obj.dateCreated.split('T')[0],
          id: obj.id,
          likes: obj.numOfLikes,
          dislikes: obj.numOfDislikes,
          views: obj.numOfViewers,
          sample: obj.body.split('.')[0],
        };
      });

      setPosts({posts: temp, error: false});
      
    }).catch((err) => {
      console.error(err);
    });

    return () => {

    }
  }, [isSignedIn]);


  return (
    isOnAbout ? <About cb={setIsOnAbout} curState={{isSignedIn, account}} cbToOpenDialog={handleGetStarted}/> :
    <div className={isSignedIn ? homepagestyles.SIhp : homepagestyles.hp}>
      {
        <>
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
                  <span><Link to='/write' state={account}>Write</Link></span>
                </span>
                <div className={homepagestyles.account}>{account.name[0]}</div>
              </nav>
            </>
            :
            <>
              <nav>
                <span onClick={() => {setIsOnAbout(true)}}>About</span>
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
          isSignedIn && posts ? 
          <div className={homepagestyles.posts}>
            {
              posts.error ? <div className={homepagestyles.posterror}>There are no posts currently!</div> :
              <>
                {
                  posts.posts.map((obj, i) => {
                    return (
                      <div key={i} className={homepagestyles.post} onClick={() => {navigate('/post', {
                        state: {id: obj.id, summary: obj.sample},
                        replace: false,
                      })}}>
                        <span>{obj.author}</span>
                        <h3>{obj.title}</h3>
                        <p dangerouslySetInnerHTML={{__html: obj.sample}}></p>
                        <div>
                          <span>{obj.dateCreated}</span>
                          <div>
                            <span>{obj.likes}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                              <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/>
                            </svg>
                          </div>
                          <div>
                            <span>{obj.dislikes}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                              <path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </>
            }
          </div>
          :
          <>
            <main>
              <div>Human</div>
              <div>stories &amp; ideas</div>
              <div>A place to write, read and deepen your understanding</div>
              <button onClick={handleGetStarted}>Start reading</button>
              <img src={bkgimg} alt="bird painting" />
            </main>
            <div className={homepagestyles.bottomborder}></div>
            <footer className={homepagestyles.footer}>
              <a href="https://github.com/muchubatactics">muchubatactics</a>
              <a href="https://github.com/winterrdog">winterrdog</a>
            </footer>
          </>
        }
        </>
      }

    </div>
  );
}