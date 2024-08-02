import { Outlet } from "react-router-dom";
import Header from "./header";

import styles from '../styles/app.module.css'

export default function App() {
  return (
    <div className={styles.app}>
      <Header />
      <Outlet />
    </div>
  );
}