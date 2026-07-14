"use client";

import { useEffect, useState } from "react";
import { DashboardNav, adminNavItems } from "@/components/layout/dashboard-nav";
import { getAllProfiles, updateUserRole } from "@/lib/actions/profiles";

type Role = "user" | "owner" | "admin";

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
};

const roleColors: Record<string, string> = {
  user: "bg-secondary-container text-on-secondary-container",
  owner: "bg-primary-container/20 text-on-primary-container",
  admin: "bg-tertiary/10 text-tertiary",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const result = await getAllProfiles();
    if (result.error) {
      setError(`Gagal memuat daftar user: ${result.error}`);
      setUsers([]);
    } else {
      setUsers((result.data ?? []) as unknown as ProfileRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRoleChange(user: ProfileRow, role: Role) {
    if (role === user.role) return;
    if (!confirm(`Ubah role ${user.name} dari "${user.role}" menjadi "${role}"?`)) return;

    setSavingId(user.id);
    setNotice(null);
    setError(null);
    const result = await updateUserRole(user.id, role);
    if (result.success) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
      setNotice(`Role ${user.name} berhasil diubah menjadi ${role}.`);
    } else {
      setError(result.error ?? "Gagal mengubah role.");
    }
    setSavingId(null);
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <DashboardNav title="Mitra Sanan" subtitle="Management Portal" items={adminNavItems} />

      <main className="flex-1 md:ml-[280px] p-6 max-w-[1280px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="font-heading text-h2 text-on-surface">Manajemen User</h2>
          <p className="text-body-sm text-on-surface-variant">Kelola pengguna dan role akses</p>
        </header>

        <div aria-live="polite">
          {error && (
            <div className="mb-4 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
              {notice}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant" role="status">Memuat daftar user...</div>
        ) : (
          <div className="rounded-xl border border-outline-variant bg-surface overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-caps uppercase border-b border-outline-variant">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Bergabung</th>
                  <th className="p-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-body-sm divide-y divide-outline-variant">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold" aria-hidden="true">
                          {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-on-surface">{user.name}</p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium capitalize ${roleColors[user.role] ?? roleColors.user}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {new Date(user.created_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                    </td>
                    <td className="p-4">
                      <label className="sr-only" htmlFor={`role-${user.id}`}>Ubah role {user.name}</label>
                      <select
                        id={`role-${user.id}`}
                        value={user.role}
                        disabled={savingId === user.id}
                        onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                        className="h-9 rounded-md border border-outline-variant bg-surface-container-lowest px-2 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      >
                        <option value="user">user</option>
                        <option value="owner">owner</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-on-surface-variant">Tidak ada user.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
