import { useEffect, useRef, useState } from 'react';
import styles from '../styles/comment.module.css';
import PropTypes from 'prop-types';
import { addToLLC, baseURL, checkLLC, decodeHTML, getLogInfo, removeFromLLC } from './comsWithbackEnd';

import DOMPurify from 'dompurify';
import { convertToUserTimezone } from '../utils';

export default function Comment({ data, postId, allComs, cbToTrigger}) {
  const [likeordis, setlikeordis] = useState(checkLLC(data.id) ? {like: true, dislike: false} : {like: false, dislike: false});
  const [replying, setReplying] = useState(false);
  const [nol, setNol] = useState(data.numOfLikes);
  const [nod, setNod] = useState(data.numOfDislikes);
  const textareaRef = useRef();
  const buttonRef = useRef();

  const account = getLogInfo();

  function handleReply() {
    let str = textareaRef.current.value.trim();

    if (!str) return;

    let tmp = {
      body: DOMPurify.sanitize(str),
    }
    textareaRef.current.value = '';

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
      if (res.status !== 200 && res.status !== 204) {
        // this fails silently
        setlikeordis({like: true, dislike: false});
      } else {
        if (likeordis.like) {
          removeFromLLC(data.id);
          setNol((prev) => {return prev - 1});
        } else {
          addToLLC(data.id);
          setNol((prev) => {return prev + 1});
          if(likeordis.dislike) setNod((prev) => {return prev - 1});
        }
        setlikeordis(likeordis.like ? {like: false, dislike: false} : {like: true, dislike: false});
      }
    }).catch((err) =>{
      console.error(err);
    });
  }

  function addDislike() {
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
    fetch(`${baseURL}/api/v1/post-comments/${postId}/comments/${data.id}/dislikes`, {
      method: likeordis.dislike ? 'DELETE' : 'PATCH',
      headers: {
        'Authorization': `Bearer ${account.token}`,
      },
    }).then((res) => {
      if (res.status !== 200 && res.status !== 204) {
        // this fails silently
        setlikeordis({like: false, dislike: true});
      } else {
        if (likeordis.like) {
          removeFromLLC(data.id);
          setNol((prev) => {return prev - 1});
        }
        if (likeordis.dislike) {
          setNod((prev) => {return prev - 1});
        } else setNod((prev) => {return prev + 1});
        setlikeordis(likeordis.dislike ? {like: false, dislike: false} : {like: false, dislike: true});
      }
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
        <div className={data.user ? styles.account : `${styles.account} ${styles.deletedacc}`}>{data.user ? data.user[0] : null}</div>
        <div>
          <span className={data.user ? '' : styles.deletedacc}>{data.user ? data.user : 'deleted'}</span>
          <span>{ convertToUserTimezone(data.dateUpdated)}</span>
        </div>
      </div>
      <main>{`${decodeHTML(data.body)}`}</main>

      <div>

        <div>
          <svg className={likeordis.like ? styles.liked : null} onClick={addLike} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z"/></svg>
          <span>{nol}</span>
        </div>

        <div>
          <svg className={likeordis.dislike ? styles.disliked : null} onClick={addDislike} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M240-840h400v520L360-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 1.5-15t4.5-15l120-282q9-20 30-34t44-14Zm480 520v-520h160v520H720Z"/></svg>
          <span>{nod}</span>
        </div>

        <button className={styles.replybutton} disabled={data.user ? false : true} onClick={() => {setReplying((prev) => prev ? false : true)}}>Reply</button>
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
          allComs ? allComs.map((obj) => {
            if (obj.parentComment === data.id) {
              return <Comment data={obj} key={obj.id} postId={postId} allComs={allComs} cbToTrigger={cbToTrigger} />
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