import { useEffect, useRef, useState } from 'react';
import styles from '../styles/comment.module.css';
import PropTypes from 'prop-types';
import { baseURL, getLogInfo } from './comsWithbackEnd';

export default function Comment({ data, postId, allComs, cbToTrigger}) {
  const [likeordis, setlikeordis] = useState({like: false, dislike: false});  
  const [replying, setReplying] = useState(false);
  const textareaRef = useRef();
  const buttonRef = useRef();

  const account = getLogInfo();

  function handleReply() {

    if (!textareaRef.current.value) return;

    let tmp = {
      body: String(textareaRef.current.value),
    }

    fetch(`${baseURL}/api/v1/post-comments/${postId}/comments/${data.id}/replies`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${account.token}`,
      },
      body: JSON.stringify(tmp),
    }).then((res) => {
      if (res.status != 201) throw new Error('problem sending reply');
      else {
        textareaRef.current.value = '';
        setReplying(false);
        cbToTrigger();
      }
    }).catch((err) => {
      console.error(err);
    });

  }

  function addLike() {
    fetch(`${baseURL}/api/v1/post-comments/${postId}/comments/${data.id}/likes`, {
      method: likeordis.like ? 'DELETE' : 'PATCH',
      headers: {
        'Authorization': `Bearer ${account.token}`,
      },
    }).then((res) => {
      if (res.status !== 200) {
        // this fails silently
      }
      setlikeordis(likeordis.like ? {like: false, dislike: false} : {like: true, dislike: false});
    }).catch((err) =>{
      console.error(err);
    });
  }

  function addDislike() {
    fetch(`${baseURL}/api/v1/post-comments/${postId}/comments/${data.id}/dislikes`, {
      method: likeordis.dislike ? 'DELETE' : 'PATCH',
      headers: {
        'Authorization': `Bearer ${account.token}`,
      },
    }).then((res) => {
      if (res.status !== 200) {
        // this fails silently
      }
      setlikeordis(likeordis.dislike ? {like: false, dislike: false} : {like: false, dislike: true});
    }).catch((err) =>{
      console.error(err);
    });
  }

  useEffect(() => {
    buttonRef.current.setAttribute('disabled', 'true');
  }, []);

  return (
    <div className={styles.comment}>
      <div>
        <div className={styles.account}>{data.user[0]}</div>
        <div>
          <span>{data.user}</span>
          <span>{data.dateCreated.split('T')[0]}</span>
        </div>
      </div>
      <main dangerouslySetInnerHTML={{__html: data.body}}></main>

      <div>

        <div>
          <svg className={likeordis.like ? styles.liked : null} onClick={addLike} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z"/></svg>
          <span>{data.numOfLikes}</span>
        </div>

        <div>
          <svg className={likeordis.dislike ? styles.disliked : null} onClick={addDislike} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M240-840h400v520L360-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 1.5-15t4.5-15l120-282q9-20 30-34t44-14Zm480 520v-520h160v520H720Z"/></svg>
          <span>{data.numOfDislikes}</span>
        </div>

        <button className={styles.replybutton} onClick={() => {setReplying((prev) => prev ? false : true)}}>Reply</button>
      </div>

      <div className={styles.replies}>
        <textarea name="reply" id="reply" placeholder='Reply to comment' className={replying ? null : styles.off} ref={textareaRef} onInput={(e) => {
          textareaRef.current.value ? buttonRef.current.removeAttribute('disabled'): buttonRef.current.setAttribute('disabled', 'true');
          e.preventDefault();
          e.target.style.height = '';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}></textarea>
        <button type='button' className={`${replying ? null : styles.off} ${styles.repres}`} ref={buttonRef} onClick={handleReply} >Respond</button>

        {
          allComs ? allComs.map((obj, i) => {
            if (obj.parentComment === data.id) {
              return <Comment data={obj} key={i} postId={postId} allComs={allComs} cbToTrigger={cbToTrigger} />
            } else return null;
          }) : null
        }
      </div>
    </div>
  )
}

Comment.propTypes = {
  data: PropTypes.object,
  postId: PropTypes.string,
  allComs: PropTypes.array,
  cbToTrigger: PropTypes.func,
}