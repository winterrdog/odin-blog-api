import { useRef, useState } from 'react';
import styles from '../styles/comment.module.css';
import PropTypes from 'prop-types';
import { baseURL, getLogInfo } from './comsWithbackEnd';

export default function Comment({ data, postId, allComs, cbToTrigger}) {
  const [replying, setReplying] = useState(false);
  const textareaRef = useRef();
  const buttonRef = useRef();

  const account = getLogInfo();

  function handleReply(e) {
    console.log('clicked', e);

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
      return res.json();
    }).then((res) => {
      console.log(res);
      textareaRef.current.value = '';
      setReplying(false);
      cbToTrigger();
    }).catch((err) => {
      console.error(err);
    });

  }

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
      <button onClick={() => {setReplying((prev) => prev ? false : true)}}>Reply</button>
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