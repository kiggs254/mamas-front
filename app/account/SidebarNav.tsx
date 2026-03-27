"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Settings, LogOut, Heart, Repeat } from "lucide-react";
import styles from "./layout.module.css";
import { apiPost } from "@/lib/api";

type Props = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

const navItems = [
  { name: "Dashboard", href: "/account", icon: Settings, exact: true },
  { name: "Profile", href: "/account/profile", icon: User, exact: false },
  { name: "Orders", href: "/account/orders", icon: Package, exact: false },
  { name: "Addresses", href: "/account/addresses", icon: MapPin, exact: false },
  { name: "Wishlist", href: "/account/wishlist", icon: Heart, exact: false },
  { name: "Subscriptions", href: "/account/subscriptions", icon: Repeat, exact: false },
];

export default function SidebarNav({ firstName, lastName, email }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .join("") || (email ? email.charAt(0).toUpperCase() : "?");

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "My Account";

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
      <div className={styles.sidebarAvatar}>
        <div className={styles.avatarCircle}>{initials}</div>
        <div className={styles.avatarInfo}>
          <span className={styles.avatarName}>{displayName}</span>
          {email && <span className={styles.avatarEmail}>{email}</span>}
        </div>
      </div>

      <div className={styles.sidebarSection}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                >
                  <item.icon className={styles.navIcon} size={18} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.sidebarFooter}>
        <button type="button" onClick={() => logout()} className={styles.logoutButton}>
          <LogOut className={styles.navIcon} size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
