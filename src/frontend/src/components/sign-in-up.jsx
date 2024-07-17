import { useState } from 'react';
import styles from '../styles/signinup.module.css';
import PropTypes from 'prop-types';

export default function Signinup({handleClose, source}) {

  // signin -> 1 ||| signup -> 0
  const [src, setSrc] = useState(source == 'up' ? 0 : 1);

  return (
    <div className={styles.main}>
      <div>
        <svg width="29" height="29" onClick={() => {handleClose()}}>
          <path fillRule="evenodd" d="m20.13 8.11-5.61 5.61-5.609-5.61-.801.801 5.61 5.61-5.61 5.61.801.8 5.61-5.609 5.61 5.61.8-.801-5.609-5.61 5.61-5.61"></path>
        </svg>
      </div>
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
      <form action="">
        <label htmlFor="username">
          <span>Your username</span>
          <input type="text" name="username" id="username" />
        </label>
        <label htmlFor="password">
          <span>Your password</span>
          <input type="password" name="password" id="password" />
        </label>
        {
          src ? 
          null
          :
          <label htmlFor="confirm">
            <span>Confirm your password</span>
            <input type="password" name="confirm" id="confirm" />
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
      
    </div>
  );
}

Signinup.propTypes = {
  handleClose: PropTypes.func,
  source: PropTypes.string,
};