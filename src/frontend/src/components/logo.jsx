import logoStyle from '../styles/logo.module.css';
import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <div className={logoStyle.logo}>
      <Link to='/' >the trie</Link>
    </div>
  );
}