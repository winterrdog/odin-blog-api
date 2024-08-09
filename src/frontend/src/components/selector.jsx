import { useState } from 'react';
import styles from '../styles/selector.module.css';
import { useEffect } from 'react';
import { baseURL, decodeHTML, getLogInfo } from './comsWithbackEnd';
import { useNavigate } from 'react-router-dom';

export default function Selector() {
  const [selected, setSelected] = useState('r');
  const [data, setData] = useState(null);
  const [deleteCounter, setDeleteCounter] = useState(0);
  const navigate = useNavigate();

  const account = getLogInfo();

  useEffect(() => {
    const reference = {
      r: 'posts/recently-viewed',
      yp: 'posts/user-posts',
      lp: 'posts/liked-posts',
      yc: 'post-comments/user-comments',
      lc: 'post-comments/user-liked-comments',
    }
    let url = `${baseURL}/api/v1/${reference[selected]}`;

    fetch(url, {
      mode: 'cors',
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${account.token}`,
      }
    }).then((res) => {
      if (res.status !== 200) {
        setData({error: true});
        throw new Error('failed to fetch');
      } else return res.json();
    }).then((res) => {
      console.log(res);

      if (res.posts) {
        let temp = res.posts.map((obj) => {
          let sampled = obj.body.split('.')[0];
        
          if (sampled.length > 75) {
            sampled = sampled.substr(0, 70) + '...';
          }
          
          if (selected === 'yp') {
            return {
              title: obj.title,
              dateUpdated: obj.dateUpdated.split('T')[0],
              id: obj.id,
              likes: obj.numOfLikes,
              dislikes: obj.numOfDislikes,
              views: obj.numOfViewers,
              sample: sampled,
              body: obj.body,
            };
          } else {
            return {
              author: obj.author,
              title: obj.title,
              id: obj.id,
              sample: sampled,
            };
          }
        });

        setData({posts: temp});
      } else {
        // todo
        let coms = res.comments.map((com) => {
          return {
            user: com.user,
            dateUpdated: com.dateUpdated.split('T')[0],
            parent: com.parentComment ? true : false,
            body: com.body,
            numOfDislikes: com.numOfDislikes,
            numOfLikes: com.numOfLikes,
          };
        });
        setData({comments: coms});
      }

    }).catch((err) => {
      console.error(err);
    });

    return () => {

    }

  }, [selected, account.token, deleteCounter]);

  function handleDelete(e, id) {
    e.stopPropagation();
    fetch(`${baseURL}/api/v1/posts/${id}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${account.token}`,
      }
    }).then((res) => {
      if (res.status !== 204) throw new Error('could not delete');
      setDeleteCounter((prev) => {return prev + 1;});
    }).catch((err) => {
      console.error(err);
    });
  }

  function handleEdit(obj) {
    navigate('/write', {
      state: {
        title: obj.title,
        body: obj.body,
        id: obj.id,
      }
    });
  }

  return (
    <div className={styles.selector}>
      <div>
        <span className={selected == 'r'? styles.selected : ''} onClick={() => {setSelected('r')}}>Recent <div></div></span>
        <span className={selected == 'yp' ? styles.selected : ''} onClick={() => {setSelected('yp')}}>Your posts <div></div></span>
        <span className={selected == 'lp' ? styles.selected : ''} onClick={() => {setSelected('lp')}}>Liked posts <div></div></span>
        <span className={selected == 'yc' ? styles.selected : ''} onClick={() => {setSelected('yc')}}>Your comments <div></div></span>
        <span className={selected == 'lc' ? styles.selected : ''} onClick={() => {setSelected('lc')}}>Liked comments <div></div></span>
      </div>
      <main>
        {
          data ? 
          <>
            {
              data.error ?
              <>
                <span style={{marginTop: '20px', display: 'block', color: 'rgb(189, 189, 189)'}}>Nothing to see here, you have none so far!</span>
              </>
              :
              <>
              {
                // show data here
                data.posts ? 
                data.posts.map((obj, i) => {
                  return (
                    <div key={i} className={styles.post}>
                      {
                        selected == 'yp' ? null :
                        <span>{obj.author}</span>
                      }
                      <h3 onClick={() => {
                        navigate('/post', {
                          state: {id: obj.id, summary: obj.sample},
                        });
                      }}>{obj.title}</h3>
                      <p onClick={() => {
                        navigate('/post', {
                          state: {id: obj.id, summary: obj.sample},
                        });
                      }}>{`${decodeHTML(obj.sample)}`}</p>
                      {
                        selected == 'yp' ?
                        <>
                          <div className={styles.poststat} onClick={() => {
                            navigate('/post', {
                              state: {id: obj.id, summary: obj.sample},
                            });
                          }}>
                            <span>{obj.dateUpdated}</span>
                            <div>
                              <span>{obj.likes}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(26, 137, 23)"><path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z"/></svg>
                            </div>
                            <div>
                              <span>{obj.dislikes}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(187, 1, 1)"><path d="M240-840h400v520L360-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 1.5-15t4.5-15l120-282q9-20 30-34t44-14Zm480 520v-520h160v520H720Z"/></svg>
                            </div>
                            <div>
                              <span>{obj.views}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Z"/></svg>
                            </div>
                          </div>
                          <div className={styles.postmanage}>
                            <button onClick={(e) => {handleDelete(e, obj.id)}}>Delete</button>
                            <button onClick={() => {handleEdit(obj)}}>Edit</button>
                          </div>
                        </>
                        :
                        null
                      }
                    </div>
                  );
                })
                : 
                data.comments.map((obj, i) => {
                  return (
                    <div className={`${styles.comment} ${obj.parent ? styles.parent : null}`} key={i}>
                      <div>
                        <div className={styles.account}>{obj.user[0]}</div>
                        <div>
                          <span>{obj.user}</span>
                          <span>{obj.dateUpdated}</span>
                        </div>
                      </div>
                      <main>{`${decodeHTML(obj.body)}`}</main>

                      {
                        selected === 'yc' ? 
                        <>
                          <div>
                            <div>
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z"/></svg>
                              <span>{obj.numOfLikes}</span>
                            </div>

                            <div>
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#aaaaaa"><path d="M240-840h400v520L360-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 1.5-15t4.5-15l120-282q9-20 30-34t44-14Zm480 520v-520h160v520H720Z"/></svg>
                              <span>{obj.numOfDislikes}</span>
                            </div>
                          </div>
                        </>
                        : null
                      }
                    </div>
                  );
                })
              }
              </>
            }
          </> 
          : 
          null
        }
      </main>
    </div>
  );
}