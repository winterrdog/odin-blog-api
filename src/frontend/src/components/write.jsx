import styles from '../styles/write.module.css';

import { baseURL, getLogInfo } from './comsWithbackEnd';
import { Link } from 'react-router-dom';
import Logo from './logo.jsx';
import { useRef, useState } from 'react';

export default function Write() {
  const buttonRef = useRef();
  const [content, setContent] = useState([]);
  const formRef = useRef();
  const [published, setPublished] = useState({message: null, status: false});
  
  const acc = getLogInfo();

  function publish() {
    let data = {};
    data.title = content[0].val;
    data.body = content.reduce((prev, obj) => {
      if (obj.key == 1) return '';
      else return prev + obj.val;
    }, '');

    fetch(`${baseURL}/api/v1/posts/`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-type': 'Application/json',
        'Authorization': `Bearer ${acc.token}`,
      },
      body: JSON.stringify(data),
    }).then((res) => {
      return res.json();
    }).then((res) => {
      let result = {};
      if (res.message === 'Post created successfully') result.message = 'Published Successfully';
      else result.message = 'Something went wrong!';

      result.status = true;

      setPublished(result);
    }).catch((err) => {
      console.error(err);
    })
  }

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
          <button disabled={content.length > 1 ? false : true} onClick={publish} ref={buttonRef}>Publish</button>
          <div className={styles.account}>{acc.name[0]}</div>
        </div>
      </header>
      {
        published.status ? 
        <div>
          <div>{published.message}</div>
          {
            published.message == 'Something went wrong!'
            ? 
            <button onClick={() => {setPublished({status:false})}}>Try again</button>
            :
            <Link to='/'><button>Back to homepage</button></Link>
          }
        </div>
        :
        <main>
          {
            content.map((obj) => {
              if (obj.key == 1) {
                return <h3 key={obj.key}>{obj.val}</h3>
              }
              return <p key={obj.key}>{obj.val}</p>
            })
          }
          <form action="" ref={formRef}>
            <textarea name={content.length ? 'data' : 'title'} id="data"
              maxLength={content.length ? 524288 : 56}
              placeholder={content.length ? 'Tell your story...' : 'Title'} 
              className={content.length ? styles.data : styles.title} 
              onInput={(e) => {
                e.preventDefault();
                if (!e.nativeEvent.data && (e.nativeEvent.inputType === 'insertText' || e.nativeEvent.inputType === 'insertLineBreak')) {
                  setContent(
                    content.length ? [...content, { val: e.target.value, key: content[content.length - 1].key + 1 }] : [ { val: e.target.value, key: 1} ]
                  );
                  formRef.current.reset();
                }
                e.target.style.height = '';
                e.target.style.height = e.target.scrollHeight + 'px';
              }
            }></textarea>
          </form>
        </main>
      }

    </div>
  );
}