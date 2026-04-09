import Link from "next/link";
import styles from "./Footer.module.css";
import {
  LocationIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  CreditCardIcon,
  ArrowRightIcon,
} from "./Icons";
import { serverApiGet } from "@/lib/server-api";
import type { ShopSettings, StorePage } from "@/types/api";

export default async function Footer() {
  const [pagesData, settingsData] = await Promise.all([
    serverApiGet<{ pages: StorePage[] }>("/storefront/pages"),
    serverApiGet<{ settings: ShopSettings }>("/storefront/settings"),
  ]);

  const pages = pagesData?.pages?.slice(0, 8) || [];
  const settings = settingsData?.settings || {};
  const phone = settings.shop_phone || "044 730 9126";
  const email = settings.shop_email || "mamasmarket.vaasa@gmail.com";
  const address = settings.shop_address || "Vaasanpuistikko 20, Vaasa";

  return (
    <footer className={styles.footer}>
      <div className={styles.ctaBanner}>
        <div className={styles.ctaContent}>
          <h2>Stay home & get your daily needs from our shop</h2>
          <p>Start Your Daily Shopping with {settings.shop_name || "Mama's Market"}</p>
          <form action="/shop" method="get" className={styles.ctaSearch}>
            <input type="email" name="q" placeholder="Search products…" />
            <button type="submit">
              Shop <ArrowRightIcon size={14} color="white" />
            </button>
          </form>
        </div>
        <div className={styles.ctaImage}>
          <img
            src="/images/logo.png"
            alt="Mama's Market"
            style={{ width: "200px", filter: "brightness(0) invert(1)", opacity: 0.2 }}
          />
        </div>
      </div>

      <div className={styles.footerMain}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <img src="/images/logo.png" alt="Mama's Market" style={{ height: "45px", width: "auto" }} />
            </div>
            <p>{settings.shop_description || "Mama's Market — your local destination for authentic world flavours in Vaasa."}</p>
            <div className={styles.footerContact}>
              <div>
                <LocationIcon size={14} color="var(--color-primary)" /> <strong>Address:</strong> {address}
              </div>
              <div>
                <PhoneIcon size={14} color="var(--color-primary)" /> <strong>Call Us:</strong> {phone}
              </div>
              <div>
                <MailIcon size={14} color="var(--color-primary)" /> <strong>Email:</strong> {email}
              </div>
              <div>
                <ClockIcon size={14} color="var(--color-primary)" /> <strong>Hours:</strong> 8:00 AM - 9:00 PM, Mon -
                Sun
              </div>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h4>Company</h4>
            <ul>
              {pages.map((p) => (
                <li key={p.id}>
                  <Link href={`/pages/${p.slug}`} prefetch={false}>
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/faqs">FAQs</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Account</h4>
            <ul>
              <li>
                <Link href="/login">Sign In</Link>
              </li>
              <li>
                <Link href="/cart">View Cart</Link>
              </li>
              <li>
                <Link href="/account/wishlist">My Wishlist</Link>
              </li>
              <li>
                <Link href="/account/orders">Track My Order</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Shop</h4>
            <ul>
              <li>
                <Link href="/shop">All products</Link>
              </li>
              <li>
                <Link href="/brands">Brands</Link>
              </li>
              <li>
                <Link href="/tags">Tags</Link>
              </li>
              <li>
                <Link href="/subscriptions">Subscriptions</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Popular</h4>
            <ul>
              <li>
                <Link href="/shop?category_slug=fresh-produce">Fresh produce</Link>
              </li>
              <li>
                <Link href="/shop?on_sale=true">Deals</Link>
              </li>
              <li>
                <Link href="/blogs">Blog</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerBottomInner}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()},{" "}
            <Link href="/">{settings.shop_name || "Mama's Market"}</Link> — Authentic World Flavours. All rights
            reserved.
          </div>
          <div className={styles.footerSocial}>
            <span className={styles.socialIcon}>
              <FacebookIcon size={15} color="var(--color-primary)" />
            </span>
            <span className={styles.socialIcon}>
              <TwitterIcon size={15} color="var(--color-primary)" />
            </span>
            <span className={styles.socialIcon}>
              <InstagramIcon size={15} color="var(--color-primary)" />
            </span>
            <span className={styles.socialIcon}>
              <YoutubeIcon size={15} color="var(--color-primary)" />
            </span>
          </div>
          <div className={styles.footerPayment}>
            <span>Secured Payment Gateways</span>
            <span className={styles.paymentBadge}>
              <CreditCardIcon size={14} /> CARD
            </span>
            <span className={styles.paymentBadge}>M-PESA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
