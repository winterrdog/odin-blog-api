import { useLocation } from 'react-router-dom';
import styles from '../styles/write.module.css';

export default function Write() {
  const location = useLocation();
  console.log(location);  
  return(
    <div className={styles.write}>
    </div>
  );
}