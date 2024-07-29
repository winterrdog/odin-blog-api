import { useLocation } from "react-router-dom";
import styles from '../styles/post.module.css';
import { useEffect } from "react";
import Logo from "./logo";
import { baseURL, getLogInfo } from "./comsWithbackEnd";
import { Link } from "react-router-dom";

const account = getLogInfo();

export default function Post() {
  const location = useLocation();
  console.log(location.state.id);

  useEffect(() => {
    
    fetch(`${baseURL}/api/v1/posts/${location.state.id}/`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
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
  }, [location.state.id]);

  return (
    <div className={styles.post}>
      <header>
          <Logo />
          <>
            <nav>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="Write">
                  <path fill="currentColor" d="M14 4a.5.5 0 0 0 0-1zm7 6a.5.5 0 0 0-1 0zm-7-7H4v1h10zM3 4v16h1V4zm1 17h16v-1H4zm17-1V10h-1v10zm-1 1a1 1 0 0 0 1-1h-1zM3 20a1 1 0 0 0 1 1v-1zM4 3a1 1 0 0 0-1 1h1z"></path>
                  <path stroke="currentColor" d="m17.5 4.5-8.458 8.458a.25.25 0 0 0-.06.098l-.824 2.47a.25.25 0 0 0 .316.316l2.47-.823a.25.25 0 0 0 .098-.06L19.5 6.5m-2-2 2.323-2.323a.25.25 0 0 1 .354 0l1.646 1.646a.25.25 0 0 1 0 .354L19.5 6.5m-2-2 2 2"></path>
                </svg>
                <span><Link to='/write' >Write</Link></span>
              </span>
              <div className={styles.account}>{account.name[0]}</div>
            </nav>
          </>
        </header>
        <div className={styles.art}>
          <div className={styles.messageboard}>Nice reading!</div>
        </div>
    </div>
  );
}