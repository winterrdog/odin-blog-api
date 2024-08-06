import styles from '../styles/write.module.css';

import { baseURL, decodeHTML, getLogInfo } from './comsWithbackEnd';
import { Link, useLocation } from 'react-router-dom';
import Logo from './logo.jsx';
import { useRef, useState } from 'react';

export default function Write() {
  const buttonRef = useRef();
  const [content, setContent] = useState([]);
  const formRef = useRef();
  const [published, setPublished] = useState({message: null, status: false});

  const location = useLocation();
  console.log(location);

  if (location.state && !content.length) {
    
    console.log('in func');
    let tmp = [];
    tmp.push({
      val: decodeHTML(location.state.title),
      key: 1,
    });

    location.state.body.split('\n').map((str) => {
      tmp.push({
        val: decodeHTML(str),
        key: tmp[tmp.length - 1].key + 1,
      });
    });

    setContent(tmp);
  }
  
  const acc = getLogInfo();

  function publish() {
    let data = {};
    data.title = content[0].val;
    data.body = content.reduce((prev, obj) => {
      if (obj.key == 1) return '';
      else {
        if (obj.val[obj.val.length - 1] !== '\n') obj.val += '\n';
        return prev + obj.val;
      }
    }, '');


    if (location.state) {
      fetch(`${baseURL}/api/v1/posts/${location.state.id}`, {
        method: 'PATCH',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${acc.token}`,
        },
        body: JSON.stringify(data),
      }).then((res) => {
        console.log(res);
        let result = {};
  
        if (res.status === 200) result.message = 'Updated Successfully';
        else result.message = 'Something went wrong!';
        
        result.status = true;
        result.code = res.status;
        console.log(result);
        setPublished(result);
        
      }).catch((err) => {
        console.error(err);
      });
    } else {
      fetch(`${baseURL}/api/v1/posts/`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${acc.token}`,
        },
        body: JSON.stringify(data),
      }).then((res) => {
        let result = {};
  
        if (res.status === 201) result.message = 'Published Successfully';
        else result.message = 'Something went wrong!';
        
        result.status = true;
        result.code = res.status;
        setPublished(result);
        
      }).catch((err) => {
        console.error(err);
      });
    }
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
          <span><Link to='/posts'>All posts</Link></span>

          <button disabled={content.length > 1 ? false : true} onClick={publish} ref={buttonRef}>{ location.state ? 'Update' : 'Publish' }</button>
          <Link to='/my-account'>
            <div className={styles.account}>{acc.name[0]}</div>
          </Link>
        </div>
      </header>
      {
        published.status ? 
        <div>
          <div>{published.message}</div>
          {
            (published.code !== 201 && published.code !== 200)
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
              if (obj.clicked) {
                console.log(obj.val);
                if (obj.key == 1) {
                  return (
                    <textarea key={obj.key} name='title' id="title"
                      maxLength={56}
                      placeholder={'Title'} 
                      className={styles.title}
                      defaultValue={obj.val.split('\n')[0]} 
                      onInput={(e) => {
                        e.preventDefault();
                        if (!e.nativeEvent.data && (e.nativeEvent.inputType === 'insertText' || e.nativeEvent.inputType === 'insertLineBreak')) {
                          let tmp = [...content];
                          tmp[obj.key - 1].clicked = false;
                          tmp[obj.key - 1].val = e.target.value;
                          setContent(tmp);
                        }
                        e.target.style.height = '';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }
                    }></textarea>
                  );
                } else {
                  return (
                    <textarea key={obj.key} name='data' id="data"
                      maxLength={524288}
                      placeholder={'Tell your story...'} 
                      className={styles.data}
                      defaultValue={obj.val.slice(0, -1)} 
                      rows={(obj.val.length / 40) + 1}
                      onInput={(e) => {
                        e.preventDefault();
                        if (!e.nativeEvent.data && (e.nativeEvent.inputType === 'insertText' || e.nativeEvent.inputType === 'insertLineBreak')) {
                          let tmp = [...content];
                          tmp[obj.key - 1].clicked = false;
                          tmp[obj.key - 1].val = e.target.value;
                          setContent(tmp);
                        }
                        e.target.style.height = '';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }
                    }></textarea>
                  );
                }
              }
              if (obj.key == 1) {
                return <h3 key={obj.key} onClick={() => {
                  let tmp = [...content];
                  tmp[obj.key - 1].clicked = true;
                  setContent(tmp);
                }}>{obj.val}</h3>
              }
              return <p key={obj.key} onClick={() => {
                let tmp = [...content];
                tmp[obj.key - 1].clicked = true;
                setContent(tmp);
              }}>{obj.val}</p>
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