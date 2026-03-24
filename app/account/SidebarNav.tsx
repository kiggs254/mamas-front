"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Settings, LogOut, Heart, Repeat } from "lucide-react";
import styles from "./layout.module.css";
import { apiPost } from "@/lib/api";

const navItems = [
  { name: "Dashboard", href: "/account", icon: Settings, exact: true },
  { name: "Profile Information", href: "/account/profile", icon: User, exact: false },
  { name: "Order History", href: "/account/orders", icon: Package, exact: false },
  { name: "Address Book", href: "/account/addresses", icon: MapPin, exact: false },
  { name: "Wishlist", href: "/account/wishlist", icon: Heart, exact: false },
  { name: "Subscriptions", href: "/account/subscriptions", icon: Repeat, exact: false },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    try {
      await apiPost("/storefront/auth/logout", {});
    } catch {
      /* still redirect */
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <h2 className={styles.sidebarTitle}>My Account</h2>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                >
                  <item.icon className={styles.navIcon} size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.sidebarFooter}>
        <button type="button" onClick={() => logout()} className={styles.logoutButton}>
          <LogOut className={styles.navIcon} size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
