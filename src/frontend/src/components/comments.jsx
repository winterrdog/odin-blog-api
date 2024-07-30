import { PropTypes } from "prop-types";
import { baseURL, getLogInfo } from "./comsWithbackEnd";
import { useEffect, useRef } from "react";

import styles from '../styles/comments.module.css';

export default function Comments({ id, cbToClose }) {
  
  const account = getLogInfo();
  const textareaRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    fetch(`${baseURL}/api/v1/post-comments/${id}/comments/`, {
      mode: 'cors',
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    }).then((res) => {
      return res.json();
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.error(err);
    });

    return () => {

    }
  }, [id]);

  function handleSubmit() {
    if (!textareaRef.current.value) return;
    console.log('here');
    fetch(`${baseURL}/api/v1/post-comments/${id}/comments/`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${account.token}`,
      },
      body: JSON.stringify(String(textareaRef.current.value)),
    }).then((res) => {
      return res.json();
    }).then((res) => {
      console.log(res);
      textareaRef.current.reset();
    }).catch((err) => {
      console.error(err);
    });

  }

  return (
    <div className={styles.comments}>
      <header>
        <span>Responses ({0})</span>
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
        <button ref={buttonRef}  onClick={handleSubmit}>Respond</button>
      </div>
    </div>
  );
}

Comments.propTypes = {
  id: PropTypes.string,
  cbToClose: PropTypes.func,
}