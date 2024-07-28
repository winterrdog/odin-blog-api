import { useLocation } from 'react-router-dom';
import styles from '../styles/write.module.css';

import { getLogInfo } from './comsWithbackEnd';
import { Link } from 'react-router-dom';
import Logo from './logo.jsx';
import { useRef, useState } from 'react';

const acc = getLogInfo();

export default function Write() {
  const location = useLocation();
  const buttonRef = useRef();
  const [content, setContent] = useState([]);
  const formRef = useRef();

  console.log(location);  
  if (content.length > 1) buttonRef.current.removeAttribute('disabled');

  return(
    <div className={styles.write}>
      <header>
        <div>
          <Link to='/'>
            <Logo />
          </Link>
          <span>Draft for&#160;<span className={styles.accname}>{acc.name}</span></span>
        </div>
        <div>
          <button disabled onClick={() => {console.log('clicked')}} ref={buttonRef}>Publish</button>
          <div className={styles.account}>{acc.name[0]}</div>
        </div>
      </header>
      <main>
        {
          content.map((obj) => {
            return obj.element;
          })
        }
        <form action="" ref={formRef}>
          <textarea name={content.length ? 'data' : 'title'} id="data"
            placeholder={content.length ? 'Tell your story...' : 'Title'} 
            className={content.length ? styles.data : styles.title} onInput={(e) => {
            if (!e.nativeEvent.data && (e.nativeEvent.inputType === 'insertText' || e.nativeEvent.inputType === 'insertLineBreak')) {
              setContent(
                content.length ? [...content, { element: <p key={content[content.length - 1].key}>{e.target.value}</p>, key: content[content.length - 1].key + 1 }] : [ { element: <h3>{e.target.value}</h3>, key: 1} ]
              );
              formRef.current.reset();
            }
            e.target.style.height = '';
            e.target.style.height = Math.min(500, e.target.scrollHeight) + 'px';
          }}></textarea>
        </form>
      </main>
    </div>
  );
}