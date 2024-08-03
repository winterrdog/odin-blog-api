import styles from '../styles/myaccount.module.css';
import { getLogInfo } from './comsWithbackEnd.js';
import Selector from './selector.jsx';

export default function MyAccount() {
  const account = getLogInfo();
  return (
    <div className={styles.myaccount}>
      <main>
        <h1>{account.name.split('_').join(' ')}</h1>
        <Selector />
      </main>
      <div className={styles.side}>
        <div className={styles.account}>{account.name[0]}</div>
        <div>{account.name}</div>
        <button>Edit profile</button>
      </div>
    </div>
  ); 
}