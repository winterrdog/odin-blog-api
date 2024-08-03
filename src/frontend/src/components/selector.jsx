import styles from '../styles/selector.module.css';

export default function Selector() {
  return (
    <div className={styles.selector}>
      <div>
        <span>Recent</span><span>Your posts</span><span>Liked posts</span><span>Your comments</span><span>Liked comments</span>
      </div>
    </div>
  );
}