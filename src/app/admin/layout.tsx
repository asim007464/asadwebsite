import type { ReactNode } from "react";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { isAdminAuthenticated, isAdminOwner } from "@/lib/admin-auth";
import { SITE_SHOP_NAME } from "@/lib/site-brand";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const ok = await isAdminAuthenticated();
  if (!ok) return children;

  const owner = await isAdminOwner();

  return (
    <AdminChrome owner={owner} shopName={SITE_SHOP_NAME}>
      {children}
    </AdminChrome>
  );
}
