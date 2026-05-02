"use client";

import { Button } from "@/components/ui/button";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";

const mockUsers = [
  { id: 1, name: "Sarah Jenkins", email: "sarah@example.com", role: "user", joinDate: "Jan 2026", reviews: 8 },
  { id: 2, name: "Bu Noer", email: "bunoer@example.com", role: "owner", joinDate: "Dec 2025", reviews: 0 },
  { id: 3, name: "Budi Santoso", email: "budi@example.com", role: "user", joinDate: "Feb 2026", reviews: 12 },
  { id: 4, name: "Admin Sanan", email: "admin@sananexplorer.id", role: "admin", joinDate: "Nov 2025", reviews: 0 },
  { id: 5, name: "Rina Wati", email: "rina@example.com", role: "user", joinDate: "Mar 2026", reviews: 5 },
  { id: 6, name: "Pak Darmo", email: "darmo@example.com", role: "owner", joinDate: "Jan 2026", reviews: 0 },
];

export default function AdminUsersPage() {
  const roleColors: Record<string, string> = {
    user: "bg-secondary-container text-on-secondary-container",
    owner: "bg-primary-container/20 text-on-primary-container",
    admin: "bg-tertiary/10 text-tertiary",
  };

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Manajemen User</h2>
          <p className="text-body-sm text-on-surface-variant">Kelola pengguna dan role akses</p>
        </header>

        <div className="rounded-xl border border-outline-variant bg-surface overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase border-b border-outline-variant">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Bergabung</th>
                <th className="p-4 font-medium">Reviews</th>
                <th className="p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{user.name}</p>
                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium capitalize ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface-variant">{user.joinDate}</td>
                  <td className="p-4 text-on-surface">{user.reviews}</td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <span className="material-symbols-outlined text-sm">edit</span> Edit Role
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}