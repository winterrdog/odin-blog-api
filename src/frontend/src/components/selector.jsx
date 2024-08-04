import { useState } from 'react';
import styles from '../styles/selector.module.css';
import { useEffect } from 'react';
import { baseURL, getLogInfo } from './comsWithbackEnd';

export default function Selector() {
  const [selected, setSelected] = useState('r');
  const [data, setData] = useState(null);

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
    }).catch((err) => {
      console.error(err);
    });

    return () => {

    }

  }, [selected, account.token]);

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
          data ? <>
          {
            data.error ? <><span>An error eccoured</span></> :
            <>
            {
              // show data here
            }
            </>
          }
          </> : null
        }
      </main>
    </div>
  );
}