"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/components/user-menu.module.css";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Enhanced logout function
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const initial =
    user?.full_name?.[0]?.toUpperCase() ||
    user?.username?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className={styles.container} ref={menuRef}>
      <div
        className={styles.avatar}
        onClick={() => setMenuOpen(!menuOpen)}
        title="Click to open menu"
      >
        {initial}
      </div>

      {menuOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {user?.full_name || user?.username}
            </div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>

          <div className={styles.separator} />

          <div className={styles.menuItem} onClick={handleLogout}>
            <span>Logout</span>
          </div>
        </div>
      )}
    </div>
  );
}
