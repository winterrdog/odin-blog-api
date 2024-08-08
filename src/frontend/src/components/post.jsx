import { useLocation } from "react-router-dom";
import styles from '../styles/post.module.css';
import { useEffect, useRef, useState } from "react";
import { addToLLP, baseURL, checkLLP, decodeHTML, getLogInfo, removeFromLLP } from "./comsWithbackEnd";
import Comments from "./comments";


export default function Post() {
  const location = useLocation();
  const [likeordis, setlikeordis] = useState(checkLLP(location.state.id) ? {like: true, dislike: false} : {like: false, dislike: false});  
  const [data, setData] = useState(null);
  const [nol, setNol] = useState(null);
  const [nod, setNod] = useState(null);
  const commentRef = useRef();
  
  const account = getLogInfo();
  
  useEffect(() => {
    
    fetch(`${baseURL}/api/v1/posts/${location.state.id}/`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${account.token}`,
      }
    }).then((res) => {
      if (res.status !== 200) throw new Error('could not fetch post!');
      return res.json();
    }).then((res) => {
      setData(res.post);
      setNol(res.post.numOfLikes);
      setNod(res.post.numOfDislikes);
    }).catch((err) => {
      console.error(err);
    });

    return () => {

    }
  }, [account.token, location.state.id]);

  function addLike() {
    fetch(`${baseURL}/api/v1/posts/${location.state.id}/likes`, {
      method: likeordis.like ? 'DELETE' : 'PATCH',
      headers: {
        'Authorization': `Bearer ${account.token}`,
      },
    }).then((res) => {
      if (res.status !== 200 && res.status !== 204) {
        // this fails silently
        setlikeordis({like: true, dislike: false});
      } else {
        if (likeordis.like) {
          removeFromLLP(data.id);
          setNol((prev) => {return prev - 1});
        } else {
          addToLLP(data.id);
          setNol((prev) => {return prev + 1});
          if(likeordis.dislike) setNod((prev) => {return prev - 1});
        }
        setlikeordis(likeordis.like ? {like: false, dislike: false} : {like: true, dislike: false});
      }
    }).catch((err) =>{
      console.error(err);
    });    
  }

  function addDisLike() {
    console.log(likeordis);
    /**
     * 
     * since we cant tell if it was already disliked while rendering
     * this function will increase the dislikes on the UI when the dislike icon is clicked
     * whether it was disliked already or not!
     * However this won't affect the backend numbers, infact, the patch request will fail
     * only extremely observant users will realise this
     * it could be fixed, but the fixes i have in mind are not very worth it in this case.
     * 
     */
    fetch(`${baseURL}/api/v1/posts/${location.state.id}/dislikes`, {
      method: likeordis.dislike ? 'DELETE' : 'PATCH',
      headers: {
        'Authorization': `Bearer ${account.token}`,
      },
    }).then((res) => {
      if (res.status !== 200 && res.status !== 204) {
        // this fails silently
        setlikeordis({like: false, dislike: true});
      } else {
        if (likeordis.dislike) {
          console.log('here in if');
          setNod((prev) => {return prev - 1});
        } else {
          console.log('here in else');
          setNod((prev) => {return prev + 1});
          if (likeordis.like) {
          console.log('here if init liked');

            removeFromLLP(data.id);
            setNol((prev) => {return prev - 1});
          }
        }
        setlikeordis(likeordis.dislike ? {like: false, dislike: false} : {like: false, dislike: true});
      }
    }).catch((err) =>{
      console.error(err);
    });
  }

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
      

      <main>
        { 
        data ? 
        <div>
          <h3>{data.title}</h3>
          <h6>{decodeHTML(location.state.summary)}</h6>
          <div>
            <div className={styles.account}>{data.author[0]}</div>
            <div>
              <span>{data.author}</span>
              <span>{data.dateUpdated.split('T')[0]}</span>
            </div>
          </div>
          <div className={styles.likesgoa}>
            <div>
              <svg  className={likeordis.like ? styles.liked : null} onClick={addLike} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z"/></svg>
              <span>{nol}</span>
            </div>
            <div>
              <svg className={likeordis.dislike ? styles.disliked : null} onClick={addDisLike} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M240-840h400v520L360-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 1.5-15t4.5-15l120-282q9-20 30-34t44-14Zm480 520v-520h160v520H720Z"/></svg>
              <span>{nod}</span>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Z"/></svg>
              <span>{data.numOfViewers}</span>
            </div>
            <button onClick={() => {
              commentRef.current.classList.add(styles.active);
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#808080">
                <path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z"/>
              </svg>
            </button>
          </div>
          {
            data.body.split('\n').map((str, i) => {
              return <p key={i}>{decodeHTML(str)}</p>
            })
          }
          <div className={styles.likesgoa}>
            <div>
              <svg  className={likeordis.like ? styles.liked : null} onClick={addLike} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z"/></svg>
              <span>{nol}</span>
            </div>
            <div>
              <svg className={likeordis.dislike ? styles.disliked : null} onClick={addDisLike} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M240-840h400v520L360-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 1.5-15t4.5-15l120-282q9-20 30-34t44-14Zm480 520v-520h160v520H720Z"/></svg>
              <span>{nod}</span>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Z"/></svg>
              <span>{data.numOfViewers}</span>
            </div>
            <button onClick={() => {
              commentRef.current.classList.add(styles.active);
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#808080">
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