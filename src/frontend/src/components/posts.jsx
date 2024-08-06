import { useNavigate } from 'react-router-dom';
import styles from '../styles/posts.module.css';

import { baseURL, checkIfLoggedIn, decodeHTML, shortCutToSignIn } from './comsWithbackEnd';
import { useEffect, useState } from 'react';

export default function Posts() {
  const [posts, setPosts] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    console.log('has fetched posts');

    fetch(`${baseURL}/api/v1/posts/`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
      }
    }).then((response) => {
      if (response.status !== 200) {
        setPosts({error: true}); 
        throw new Error('could not fetch posts');
      } else return response.json();
    }).then((response) => {

      let temp = response.posts.map((obj) => {
        return {
          author: obj.author,
          title: obj.title,
          dateUpdated: obj.dateUpdated.split('T')[0],
          id: obj.id,
          likes: obj.numOfLikes,
          dislikes: obj.numOfDislikes,
          views: obj.numOfViewers,
          sample: obj.body.split('.')[0],
        };
      });

      setPosts({posts: temp, error: false});
      
    }).catch((err) => {
      console.error(err);
    });

    return () => {

    }
  }, []);


  return (
    <div className={styles.posts}>
      {
        posts && posts.error ? <div className={styles.posterror}>There are no posts currently!</div> :
        <>
          {
            posts ? posts.posts.map((obj, i) => {
              return (
                <div key={i} className={styles.post} onClick={() => {
                  if (checkIfLoggedIn()) {
                    navigate('/post', {
                      state: {id: obj.id, summary: obj.sample},
                    });
                  } else shortCutToSignIn.callCb();
                }}>
                  <span>{obj.author}</span>
                  <h3>{obj.title}</h3>
                  <p>{decodeHTML(obj.sample)}</p>
                  <div>
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
                </div>
              );
            }): null
          }
        </>
      }
    </div>
  );
}

