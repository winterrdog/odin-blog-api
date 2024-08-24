import styles from '../styles/write.module.css';

import { baseURL, decodeHTML, getLogInfo } from './comsWithbackEnd';
import { Link, useLocation } from 'react-router-dom';
import Logo from './logo.jsx';
import { useRef, useState } from 'react';

import DOMPurify from 'dompurify';

export default function Write() {
  const buttonRef = useRef();
  const [content, setContent] = useState([]);
  const formRef = useRef();
  const [published, setPublished] = useState({message: null, status: false});
  const inputRef = useRef();
  const mainRef = useRef();

  const location = useLocation();

  if (location.state && !content.length) {
    
    let tmp = [];
    tmp.push({
      val: `${decodeHTML(location.state.title)}`,
      key: 1,
    });

    location.state.body.split('\n').map((str) => {
      tmp.push({
        val: `${decodeHTML(str)}`,
        key: tmp[tmp.length - 1].key + 1,
      });
    });

    setContent(tmp);
  }
  
  const acc = getLogInfo();

  function publish() {
    console.log(mainRef.current);

    let data = {};
    data.body = '';

    /**
     * previous techique
     * 
     * 
      // data.title = content[0].val;
      // data.body = content.reduce((prev, obj) => {
      //   if (obj.key == 1) return '';
      //   else {
      //     if (obj.val[obj.val.length - 1] !== '\n') obj.val += '\n';
      //     return prev + obj.val;
      //   }
      // }, '');

      // if (inputRef.current.value !== '') {
      //   data.body += `${DOMPurify.sanitize(inputRef.current.value)}\n`;
      // }
      *
      *
     */
    //
    
    let temp = mainRef.current.children;

    for (let i = 0; i < temp.length; ++i) {
      let str;
      if (temp[i].tagName === 'TEXTAREA') {
        str = temp[i].value;
      } else {
        str = temp[i].textContent;
      }

      str = DOMPurify.sanitize(str.replace(/(\r\n|\n|\r)/gm, ' ').trim());

      if (str) {
        if (!i) data.title = str;
        else {
          data.body += (str + '\n');
        }
      }

    }

    if (inputRef.current.value !== '') {
      let str = DOMPurify.sanitize(inputRef.current.value.replace(/(\r\n|\n|\r)/gm, ' ').trim());
      data.body += (str + '\n');
    }

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
        let result = {};
  
        if (res.status === 200) result.message = 'Updated Successfully';
        else result.message = 'Something went wrong!';
        
        result.status = true;
        result.code = res.status;
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
        <main ref={mainRef}>
          {
            content.map((obj) => {
              if (obj.clicked) {
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
                          let str = e.target.value.replace(/(\r\n|\n|\r)/gm, ' ').trim();
                          if (str) {
                            let tmp = [...content];
                            tmp[obj.key - 1].clicked = false;
                            tmp[obj.key - 1].val = str;
                            setContent(tmp);
                          }

                          return;
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
                      defaultValue={obj.val} 
                      rows={(obj.val.length / 40) + 1}
                      onInput={(e) => {
                        e.preventDefault();
                        if (!e.nativeEvent.data && (e.nativeEvent.inputType === 'insertText' || e.nativeEvent.inputType === 'insertLineBreak')) {
                          let str = e.target.value.replace(/(\r\n|\n|\r)/gm, ' ').trim();
                          if (str) {
                            let tmp = [...content];
                            tmp[obj.key - 1].clicked = false;
                            tmp[obj.key - 1].val = str;
                            setContent(tmp);
                          }

                          return;
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
              ref={inputRef}
              onInput={(e) => {
                e.preventDefault();
                if (!e.nativeEvent.data && (e.nativeEvent.inputType === 'insertText' || e.nativeEvent.inputType === 'insertLineBreak')) {
                  let str = e.target.value.replace(/(\r\n|\n|\r)/gm, ' ').trim();
                  if (str) {
                    setContent(
                      content.length ? [...content, { val: DOMPurify.sanitize(str), key: content[content.length - 1].key + 1 }] : [ { val: e.target.value, key: 1} ]
                    );
                  }
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