import { useRef } from 'react';
import styles from '../styles/myaccount.module.css';
import { baseURL, clearMemory, getLogInfo, setUserNameOnly, shortCutToSignOut } from './comsWithbackEnd.js';
import Selector from './selector.jsx';
import { useNavigate } from 'react-router-dom';

export default function MyAccount() {
  const editRef = useRef();
  const messageRef = useRef();
  const account = getLogInfo();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    console.log(e);
  
    let body = {name: e.target[0].value};

    if (body.name == '') return;

    fetch(`${baseURL}/api/v1/users/update`, {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${account.token}`,
      },
      body: JSON.stringify(body),
    }).then((res) => {
      if (res.status === 200) {
        //
        showMessage('Changed succesfully, reloading', true);
        setUserNameOnly(body.name);
        // todo: reload page
      } else {
        showMessage('Failed! try again later', false);
      }
    }).catch((err) => {
      console.error(err);
    });


    e.target.reset();
  }

  function showMessage(str, positive) {
    messageRef.current.textContent = str;
    if (!positive) {
      messageRef.current.style.backgroundColor = 'rgb(128, 0, 0)';
    }
    messageRef.current.style.visibility = 'visible';

    setTimeout(() => {
      messageRef.current.style.backgroundColor = null;
      messageRef.current.style.visibility = null;
      window.location.reload();
    }, 3000);
  }

  return (
    <div className={styles.myaccount}>
      <main>
        <h1>{account.name.split('_').join(' ')}</h1>
        <Selector />
      </main>
      <div className={styles.side}>
        <div className={styles.account}>{account.name[0]}</div>
        <div>{account.name}</div>
        <button onClick={() => {
          if (editRef.current.classList.contains(styles.off)) {
            editRef.current.classList.remove(styles.off);
            editRef.current.classList.add(styles.on);
          } else {
            editRef.current.classList.remove(styles.on);
            editRef.current.classList.add(styles.off);
          }
        }}>Edit profile</button>
        <div className={`${styles.edit} ${styles.off}`} ref={editRef}>
          <form onSubmit={handleSubmit}>
            <label htmlFor="newname">
              <span>New username</span>
              <input type="text" name="newname" id="newname" pattern='\w*' placeholder='alphanumeric characters, underscores ONLY'/>
            </label>
            <button type='submit'>Submit</button>
          </form>
          <button onClick={() => {
            fetch(`${baseURL}/api/v1/users/delete`, {
              method: 'DELETE',
              mode: 'cors',
              headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${account.token}`,
              }
            }).then((res) => {
              if(res.status === 204) {
                clearMemory();
                shortCutToSignOut.callCb();
                navigate('/');
              }
            }).catch((err) => {
              console.error(err);
            });
          }}>Delete account</button>
        </div>
        <div className={styles.message} ref={messageRef}></div>
      </div>
    </div>
  ); 
}