import { PropTypes } from "prop-types";
import { baseURL, getLogInfo } from "./comsWithbackEnd";
import { useEffect, useRef, useState } from "react";
import DOMPurify from 'dompurify'

import styles from '../styles/comments.module.css';
import Comment from "./comment";

export default function Comments({ id, cbToClose }) {
  const [data, setData] = useState(null);
  const [trigger, setTrigger] = useState(1);
  const account = getLogInfo();
  const textareaRef = useRef();
  const buttonRef = useRef();


  useEffect(() => {
    fetch(`${baseURL}/api/v1/post-comments/${id}/comments/`, {
      mode: 'cors',
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${account.token}`,
      }
    }).then((res) => {
      if (res.status !== 200) throw new Error('failed to fetch comments');
      else return res.json();
    }).then((res) => {
      setData(res.comments);
    }).catch((err) => {
      console.error(err);
    });

    buttonRef.current.setAttribute('disabled', 'true');

    return () => {

    }
  }, [account.token, id, trigger]);


  function handleSubmit() {
    let str = textareaRef.current.value.trim();
    if (!str) return;

    let tmp = {
      body: String(DOMPurify.sanitize(str)),
    }

    textareaRef.current.value = '';

    fetch(`${baseURL}/api/v1/post-comments/${id}/comments/`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${account.token}`,
      },
      body: JSON.stringify(tmp),
    }).then((res) => {
      if (res.status !== 201) throw new Error('failed to post comment!');
      else {
        setTrigger((prev) =>  prev + 1);
      }
    }).catch((err) => {
      console.error(err);
    });

  }

  return (
    <div className={styles.comments}>
      <header>
        <span>Responses ({data ? data.length: 0})</span>
        <svg onClick={cbToClose} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
        </svg>
      </header>
      <div className={styles.payload}>
        <div>
          <div className={styles.account}>{account.name[0]}</div>
          <span>{account.name}</span>
        </div>
        <textarea ref={textareaRef} name="com" id="com" placeholder="What are your thoughts?" onInput={(e) => {
          textareaRef.current.value ? buttonRef.current.removeAttribute('disabled'): buttonRef.current.setAttribute('disabled', 'true');
          e.preventDefault();
          e.target.style.height = '';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}></textarea>
        <button type='button' ref={buttonRef}  onClick={handleSubmit}>Respond</button>
      </div>
      {
        data ? data.map((obj) => {
          return obj.parentComment ? null :
          <Comment data={obj} key={obj.id} postId={id} allComs={data} cbToTrigger={ () => {setTrigger((prev) => prev + 1)} }/>
        }) : null
      }
    </div>
  );
}

Comments.propTypes = {
  id: PropTypes.string,
  cbToClose: PropTypes.func,
}