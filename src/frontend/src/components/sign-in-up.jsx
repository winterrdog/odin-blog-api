import { useRef, useState } from 'react';
import styles from '../styles/signinup.module.css';
import PropTypes from 'prop-types';
import { baseURL, setToken } from './comsWithbackEnd';

export default function Signinup({handleClose, source, login}) {

  // signin -> 1 ||| signup -> 0
  const [src, setSrc] = useState(source == 'up' ? 0 : 1);
  const [output, setOutput] = useState(null);
  const formRef = useRef(null);
  const passwordRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();

    if (src) {
      let data = {
        name: e.target['0'].value,
        pass: passwordRef.current.value,
      };

      fetch(`${baseURL}/api/v1/users/sign-in`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((response) => {
        let datax = {
          ok: response.ok,
          status: response.status,
          name: String(data.name),
        }
        setOutput(datax);
        return response.json();
      }).then((res)=> {
        if (res.token) setToken(res.token);
      }).catch((error) => {
        console.log(error);
      });


    } else {
      if (e.target['1'].value != e.target['2'].value) {
        e.target['2'].setAttribute('pattern', `${passwordRef.current.value}`);
        e.target['2'].reportValidity();
        return;
      }

      let data = {
        name: e.target['0'].value,
        pass: passwordRef.current.value,
        role: 'author',
      }

      // TODO:: what to do with the token returned by the server

      fetch(`${baseURL}/api/v1/users/sign-up`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((response) => {
        let data = {
          ok: response.ok,
          status: response.status,
        }
        setOutput(data);
        return response.json();
      }).then((res) => {
        if (res.token) setToken(res.token);
      }).catch((error) => {
        console.log(error);
      });


    }
  }

  function handleCPChange(e) {
    e.target.setAttribute('pattern', `${passwordRef.current.value}`);
  }

  return (
    <div className={styles.main}>

      <div>
        <svg width="29" height="29" onClick={() => {handleClose()}}>
          <path fillRule="evenodd" d="m20.13 8.11-5.61 5.61-5.609-5.61-.801.801 5.61 5.61-5.61 5.61.801.8 5.61-5.609 5.61 5.61.8-.801-5.609-5.61 5.61-5.61"></path>
        </svg>
      </div>

      {
        output ? 
        <div className={styles.output}>
          {
            output.status == 201 ? 
            <>
              <h1>Success.</h1>
              <h4>Your account was succesfully created. All you have to do now is sign in!</h4>
              <button onClick={() => {
                setOutput(null);
                setSrc(1);
              }}>Ok</button>
            </>
            :
            output.status == 409 ?
            <>
              <h1>Failed.</h1>
              <h4>It seems this username is already taken, Try another!</h4>
              <button onClick={() => {
                setOutput(null);
                setSrc(0);
              }}>Ok</button>
            </>
            :
            output.status == 200 ?
            <>
              <h1>Success.</h1>
              <h4>You have been succesfully logged in!</h4>
              <button onClick={() => {
                login(
                  {
                    name: String(output.name),
                  }
                );
                handleClose();
              }}>Ok</button>
            </>
            :
            output.status == 401 ?
            <>
              <h1>Failed.</h1>
              <h4>It looks like you entered a wrong username and/or password! Try again.</h4>
              <button onClick={() => {
                setOutput(null);
                setSrc(1);
              }}>Ok</button>
            </>
            :
            <>
              <h3>This is not supposed to happen!</h3>
              <h4>CONTACT THE DEVELOPERS IMMEDIATELY!</h4>
              <button onClick={() => {
                handleClose()
              }}>Ok</button>
            </>
          }
        </div>
        :
        <>
        
          {
            src ?
            <>
              <h1>Welcome back.</h1>
              <h3>Enter your username and password to sign into your account.</h3>
            </> 
            :
            <>
              <h1>Join The Trie.</h1>
              <h3>Enter your username and create a password to create an account.</h3>
            </>
          }
          <form action="" onSubmit={handleSubmit} ref={formRef}>
            <label htmlFor="username">
              <span>Your username</span>
              {src ? null : <span style={{margin: '5px', color: 'rgb(95, 95, 95)', fontStyle: 'italic'}}>Must be only alphanumeric characters and underscores</span>}
              <input type="text" name="username" id="username" pattern='\w*'/>
            </label>
            <label htmlFor="password">
              <span>Your password</span>
              <input type="password" name="password" id="password" ref={passwordRef}/>
            </label>
            {
              src ? 
              null
              :
              <label htmlFor="confirm">
                <span>Confirm your password</span>
                <input type="password" name="confirm" id="confirm" onChange={handleCPChange}/>
              </label>
            }
            <button type="submit">Continue</button>
          </form>

          {
            src ?
            <span>No account? <a className={styles.linkSI} onClick={() => {setSrc((prev) => prev ? 0 : 1)}}>Create one</a></span>
            :
            <>
              <span>Already have an account? <a className={styles.linkSI} onClick={() => {setSrc((prev) => prev ? 0 : 1)}}>Sign in</a></span>
              <p>
                Click &quot;Continue&quot; to agree to The Trie&apos;s 
                &ensp;
                <span className={styles.underline}>Terms of Service</span> 
                &ensp;
                and acknowledge that The Trie&apos;s 
                &ensp;
                <span className={styles.underline}>Privacy Policy</span>
                &ensp;
                applies to you.
              </p>
            </>
          }
          
        </>
      }
    </div>
  );
}

Signinup.propTypes = {
  handleClose: PropTypes.func,
  source: PropTypes.string,
  login: PropTypes.func,
};