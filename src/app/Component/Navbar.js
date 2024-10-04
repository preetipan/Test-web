// Component/Navbar.js
import React from 'react';
import styles from './navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <h1>TEST APP</h1>
      <ul className={styles.navItems}>
        <li><a href="/">Home</a></li>
        <li><a href="/chart">Chart</a></li>
      </ul>
    </nav>
  );
};

export default Navbar; // ต้องมีการ export default ที่นี่
