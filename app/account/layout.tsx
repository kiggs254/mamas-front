import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import SidebarNav from "./SidebarNav";
import styles from "./layout.module.css";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const customer = await getCustomer();

  if (!customer) {
    redirect("/login");
  }

  return (
    <div className={styles.container}>
      <div className={styles.layoutWrapper}>
        <aside className={styles.sidebarWrapper}>
          <SidebarNav firstName={customer.first_name ?? undefined} lastName={customer.last_name ?? undefined} email={customer.email} />
        </aside>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
