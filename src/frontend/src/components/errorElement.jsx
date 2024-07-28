import styles from '../styles/errorElement.module.css';
import Logo from './logo';
import { Link } from 'react-router-dom';

export default function ErrorElement() {
  return (
    <div className={styles.errorelem}>
      <Logo />
      <p>404 Not Found!</p>
      <p>Return to&#160;
        <Link to='/'>Homepage</Link>
      </p>
    </div>
  );
}