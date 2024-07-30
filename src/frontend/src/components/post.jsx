import { useLocation } from "react-router-dom";
import styles from '../styles/post.module.css';
import { useEffect, useRef, useState } from "react";
import Logo from "./logo";
import { baseURL, getLogInfo } from "./comsWithbackEnd";
import { Link } from "react-router-dom";
import Comments from "./comments";

const account = getLogInfo();

export default function Post() {
  const [data, setData] = useState(null);
  const location = useLocation();
  const commentRef = useRef();

  useEffect(() => {
    
    fetch(`${baseURL}/api/v1/posts/${location.state.id}/`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${account.token}`,
      }
    }).then((res) => {
      return res.json();
    }).then((res) => {
      setData(res.post);
    }).catch((err) => {
      console.error(err);
    });


    return () => {

    }
  }, [location.state.id]);

  return (
    <div className={styles.post}>
      <div className={styles.comments} ref={commentRef} onClick={() => {
        commentRef.current.classList.remove(styles.active);
      }}>
        <div className={styles.actualcomments} onClick={(e) => {e.stopPropagation()}}>
          {
            data ? <Comments id={data.id} cbToClose={() => {commentRef.current.classList.remove(styles.active);}}/> : null 
          }
        </div>
      </div>
      <header>
        <Link to='/'>
          <Logo />
        </Link>
        <>
          <nav>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="Write">
                <path fill="currentColor" d="M14 4a.5.5 0 0 0 0-1zm7 6a.5.5 0 0 0-1 0zm-7-7H4v1h10zM3 4v16h1V4zm1 17h16v-1H4zm17-1V10h-1v10zm-1 1a1 1 0 0 0 1-1h-1zM3 20a1 1 0 0 0 1 1v-1zM4 3a1 1 0 0 0-1 1h1z"></path>
                <path stroke="currentColor" d="m17.5 4.5-8.458 8.458a.25.25 0 0 0-.06.098l-.824 2.47a.25.25 0 0 0 .316.316l2.47-.823a.25.25 0 0 0 .098-.06L19.5 6.5m-2-2 2.323-2.323a.25.25 0 0 1 .354 0l1.646 1.646a.25.25 0 0 1 0 .354L19.5 6.5m-2-2 2 2"></path>
              </svg>
              <span><Link to='/write' >Write</Link></span>
            </span>
            <div className={styles.account}>{account.name[0]}</div>
          </nav>
        </>
      </header>
      <div className={styles.art}>
        <div className={styles.messageboard}>Enjoy your reading!</div>
      </div>
      <main>
        { 
        data ? 
        <div>
          <h3>{data.title}</h3>
          <h6 dangerouslySetInnerHTML={{__html: location.state.summary}}></h6>
          <div>
            <div className={styles.account}>{data.author[0]}</div>
            <div>
              <span>{data.author}</span>
              <span>{data.dateCreated.split('T')[0]}</span>
            </div>
          </div>
          <div className={styles.likesgoa}>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/>
              </svg>
              <span>{data.numOfLikes}</span>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/>
              </svg>
              <span>{data.numOfDislikes}</span>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>
              </svg>
              <span>{data.numOfViewers}</span>
            </div>
            <button onClick={() => {
              commentRef.current.classList.add(styles.active);
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z"/>
              </svg>
            </button>
          </div>
          {
            data.body.split('\n').map((str, i) => {
              return <p key={i} dangerouslySetInnerHTML={{__html: str}}></p>
            })
          }
          <div className={styles.likesgoa}>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/>
              </svg>
              <span>{data.numOfLikes}</span>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/>
              </svg>
              <span>{data.numOfDislikes}</span>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>
              </svg>
              <span>{data.numOfViewers}</span>
            </div>
            <button onClick={() => {
              commentRef.current.classList.add(styles.active);
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z"/>
              </svg>
            </button>
          </div>
        </div>
        :
        <>
        </>
        }
      </main>
    </div>
  );
}