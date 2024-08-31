import { useEffect, useRef } from 'react';
import styles from '../styles/profilediv.module.css';
import { baseURL, clearMemory, getLogInfo } from './comsWithbackEnd';

import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfileDiv({ cb, parentRef }) {
  const navigate = useNavigate();
  const profileRef = useRef();

  const account = getLogInfo();

  function parentHandler (e) {
    if (e.target === parentRef.current) {
      e.stopPropagation();
    }

    if (profileRef.current.classList.contains(styles.on)) {
      profileRef.current.classList.remove(styles.on);
    } else {
      profileRef.current.classList.add(styles.on);
    }
  }

  function signouthandler(e) {
    e.stopPropagation();

    fetch(`${baseURL}/api/v1/users/log-out`, {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${account.token}`,
      }
    }).then((res) => {
      if (res.status !== 204) throw new Error('failed to log out');
    }).catch((err) => {
      console.error(err);
    })

    clearMemory();
    cb(false);
    navigate('/');
  }

  useEffect(() => {
    function handleClick() {
      if (profileRef.current.classList.contains(styles.on)) {
        profileRef.current.classList.remove(styles.on);
      }
    }

    let tmp = {...parentRef};

    parentRef.current.addEventListener('click', parentHandler);

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      tmp.current.removeEventListener('click', parentHandler);
    }
  }, );

  return (
    <div className={`${styles.profilediv}`} ref={profileRef}>
      <Link to='/my-account'>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
        <span>Profile</span>
      </Link>
      <div></div>
      <span onClick={signouthandler}>Sign out {` ${account.name}`}</span>
    </div>
  );
}

ProfileDiv.propTypes = {
  cb: PropTypes.func,
  parentRef: PropTypes.object,
}