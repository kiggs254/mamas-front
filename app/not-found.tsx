import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.code}>404</h1>
      <div className={styles.body}>
        <p className={styles.title}>This page could not be found.</p>
        <p className={styles.text}>The link may be broken or the page may have been removed.</p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
