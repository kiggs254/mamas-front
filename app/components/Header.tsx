import Link from "next/link";
import { getCustomer } from "@/lib/auth";
import { serverApiGet } from "@/lib/server-api";
import type { StorefrontCategory, ShopSettings } from "@/types/api";
import styles from "./Header.module.css";
import {
  UserIcon,
  HeartIcon,
  CompareIcon,
  PhoneIcon,
  ShieldIcon,
  PackageIcon,
} from "./Icons";
import HeaderLocation from "./HeaderLocation";
import HeaderCart from "./HeaderCart";
import HeaderSearch from "./HeaderSearch";
import BrowseCategoriesDropdown from "./BrowseCategoriesDropdown";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const [customer, catData, settingsData] = await Promise.all([
    getCustomer(),
    serverApiGet<{ categories: StorefrontCategory[] }>("/storefront/categories"),
    serverApiGet<{ settings: ShopSettings }>("/storefront/settings"),
  ]);

  const categories = catData?.categories || [];
  const phone = settingsData?.settings?.shop_phone || "0117 262 933";

  const firstName = customer
    ? [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() || "Account"
    : null;

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            <div className={styles.topBarLocation}>
              <HeaderLocation />
            </div>
            <Link href={customer ? "/account" : "/login"} style={{ textDecoration: "none", color: "inherit" }}>
              <span>
                <UserIcon size={13} /> {customer ? "My Account" : "Sign In / Register"}
              </span>
            </Link>
            <Link href="/account/wishlist" style={{ textDecoration: "none", color: "inherit" }}>
              <span>
                <HeartIcon size={13} /> Wishlist
              </span>
            </Link>
            <Link href="/account/orders" style={{ textDecoration: "none", color: "inherit" }}>
              <span>
                <PackageIcon size={13} /> Order Tracking
              </span>
            </Link>
          </div>
          <div className={styles.topBarRight}>
            <span>
              <ShieldIcon size={13} /> 100% Secure delivery without contacting the courier
            </span>
            <span>
              Need help? Call Us: <strong style={{ color: "var(--color-primary)" }}>{phone}</strong>
            </span>
            <select disabled title="Coming soon">
              <option>English</option>
            </select>
            <select disabled title="From store settings">
              <option>{settingsData?.settings?.currency || "KES"}</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.middleBar}>
        <div className={styles.middleBarInner}>
          <div className={styles.mobileNavWrap}>
            <MobileMenu
              phone={phone}
              signedIn={!!customer}
              accountLabel={firstName || "Account"}
              categories={categories}
            />
          </div>
          <Link href="/" className={styles.logo}>
            <img src="/images/logo.png" alt="Cleanshelf Supermarket" className={styles.logoImage} />
          </Link>
          <HeaderSearch categories={categories} className={styles.headerSearchSlot} />
          <div className={styles.headerActions}>
            <div className={`${styles.headerAction} ${styles.compareDesktopOnly}`}>
              <span className={styles.icon}>
                <CompareIcon size={22} />
              </span>
              <div className={styles.actionText}>
                <span className={styles.actionLabel}>Compare</span>
              </div>
            </div>
            <Link href="/account/wishlist" className={styles.headerAction}>
              <span className={styles.icon}>
                <HeartIcon size={22} />
              </span>
              <div className={styles.actionText}>
                <span className={styles.actionLabel}>Wishlist</span>
              </div>
            </Link>
            <HeaderCart />
            <Link href={customer ? "/account" : "/login"} className={styles.headerAction}>
              <span className={styles.icon}>
                <UserIcon size={22} />
              </span>
              <div className={styles.actionText}>
                <span className={styles.actionLabel}>{firstName || "Account"}</span>
              </div>
            </Link>
          </div>
          <div className={styles.mobileLocationWrap}>
            <HeaderLocation className={styles.mobileLocationBtn} />
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomBarInner}>
          <BrowseCategoriesDropdown categories={categories} />
          <nav className={styles.navLinks}>
            <Link href="/shop?on_sale=true" className={styles.navLink} prefetch={false}>
              Deals <span className={styles.hot}>Hot</span>
            </Link>
            <Link href="/" className={styles.navLink} prefetch={false}>
              Home
            </Link>
            <Link href="/pages/about-us" className={styles.navLink} prefetch={false}>
              About
            </Link>
            <Link href="/shop" className={styles.navLink} prefetch={false}>
              Shop
            </Link>
            <Link href="/brands" className={styles.navLink} prefetch={false}>
              Brands
            </Link>
            <Link href="/subscriptions" className={styles.navLink} prefetch={false}>
              Subscriptions <span className={styles.new}>New</span>
            </Link>
            <Link href="/recipes" className={styles.navLink} prefetch={false}>
              Recipes
            </Link>
            <Link href="/faqs" className={styles.navLink} prefetch={false}>
              FAQs
            </Link>
            <Link href="/store-locator" className={styles.navLink} prefetch={false}>
              Stores
            </Link>
          </nav>
          <div className={styles.headerPhone}>
            <span className={styles.phoneIcon}>
              <PhoneIcon size={26} color="var(--color-primary)" />
            </span>
            <div>
              <div className={styles.phoneLabel}>24/7 Support Center</div>
              <div className={styles.phoneNumber}>{phone}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
