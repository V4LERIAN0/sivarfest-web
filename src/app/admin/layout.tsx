import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { requireAdminServer } from "@/features/auth/auth.server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminServer();

  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      <AdminSidebar />
      <section className="flex-1 p-8">{children}</section>
    </main>
  );
}