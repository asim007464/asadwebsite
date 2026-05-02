import Link from "next/link";
import { demoteAdminStaff, promoteAdminStaff } from "@/app/admin/actions";
import { assertAdminOwner, getAdminOwnerEmail, normAdminEmail } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const USERS_PER_PAGE = 25;

function staffFlagOn(meta: Record<string, unknown> | undefined): boolean {
  const v = meta?.admin_panel;
  return v === true || v === "true";
}

function roleLabel(email: string | undefined, ownerNorm: string, meta: unknown): "Owner" | "Staff admin" | "Customer" {
  if (!email) return "Customer";
  if (normAdminEmail(email) === ownerNorm) return "Owner";
  if (staffFlagOn(meta as Record<string, unknown> | undefined)) return "Staff admin";
  return "Customer";
}

/** Profile name, or a short hint from the email local-part so the column isn’t empty. */
function displayName(meta: Record<string, unknown> | undefined, email: string): string {
  const fn = meta?.full_name;
  if (typeof fn === "string" && fn.trim()) return fn.trim();
  const n = meta?.name;
  if (typeof n === "string" && n.trim()) return n.trim();
  if (email.includes("@")) {
    const local = email.split("@")[0]?.trim();
    if (local) return local;
  }
  return "—";
}

function fmtWhen(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const btnPrimary =
  "inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 sm:min-h-0";
const btnDanger =
  "inline-flex min-h-[44px] items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-800 shadow-sm transition hover:bg-red-100 active:bg-red-100/80 disabled:opacity-50 sm:min-h-0";

function AccessBadge({ role }: { role: "Owner" | "Staff admin" | "Customer" }) {
  if (role === "Owner") {
    return (
      <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-900 ring-1 ring-violet-200/60">
        Owner
      </span>
    );
  }
  if (role === "Staff admin") {
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-900 ring-1 ring-blue-200/60">
        Staff admin
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200/80">
      Customer
    </span>
  );
}

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await assertAdminOwner();

  const sp = await searchParams;
  const err = typeof sp.error === "string" ? sp.error : "";
  const notice = typeof sp.notice === "string" ? sp.notice : "";
  const pageRaw = typeof sp.page === "string" ? sp.page : "1";
  const page = Math.max(1, Math.min(500, parseInt(pageRaw, 10) || 1));

  const owner = getAdminOwnerEmail();
  const admin = createSupabaseAdminClient();
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ page, perPage: USERS_PER_PAGE });

  const users = [...(listData?.users ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const hasNext = users.length === USERS_PER_PAGE;
  const hasPrev = page > 1;

  const errMsg =
    err === "invalid-email"
      ? "Enter a valid email."
      : err === "no-account"
        ? "No account for that email — they must register on the shop first."
        : err === "cannot-demote-owner"
          ? "The owner cannot be demoted."
          : err
            ? `Error${err.length < 120 ? `: ${err}` : ""}.`
            : "";

  const noticeMsg =
    notice === "promoted"
      ? "Admin access granted. Ask them to sign out and back in if the panel doesn’t update."
      : notice === "demoted"
        ? "Admin access removed."
        : notice === "owner-already"
          ? "That user is already the owner."
          : "";

  const q = (next: number) => {
    const u = new URLSearchParams();
    u.set("page", String(next));
    return `/admin/team?${u.toString()}`;
  };

  const pagerBtn =
    "inline-flex h-11 min-h-[44px] flex-1 min-w-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-sm hover:border-blue-300 hover:bg-blue-50 sm:h-9 sm:min-h-0 sm:min-w-[5.5rem] sm:flex-none";
  const pagerDisabled =
    "inline-flex h-11 min-h-[44px] flex-1 min-w-0 cursor-not-allowed items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-xs font-semibold text-slate-400 sm:h-9 sm:min-h-0 sm:min-w-[5.5rem] sm:flex-none";

  return (
    <main className="py-4 sm:py-6 lg:py-0">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-200/60 sm:rounded-3xl">
        {/* Compact header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-violet-50/30 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600/90">Owner only</p>
              <h1 className="text-balance text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Users &amp; admins</h1>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                <span className="font-semibold text-slate-800">{owner}</span> is always owner. Mark others as <span className="font-semibold">Staff admin</span>{" "}
                so they can use the dashboard (not this page).
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm hover:border-blue-200 hover:bg-blue-50 active:bg-slate-50 sm:py-2 sm:text-sm"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          {listErr ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">
              Could not load users: {listErr.message}
            </div>
          ) : null}

          {errMsg ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">{errMsg}</div>
          ) : null}
          {noticeMsg ? (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-950">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200/80 text-xs font-bold text-emerald-900">
                ✓
              </span>
              <span>{noticeMsg}</span>
            </div>
          ) : null}

          {/* Table + toolbar in one card */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900">Account directory</h2>
                <p className="text-xs text-slate-500">
                  Page <span className="font-semibold text-slate-700">{page}</span>
                  <span className="mx-1.5 text-slate-300">·</span>
                  {users.length} account{users.length !== 1 ? "s" : ""} on this page
                </p>
              </div>
              <div className="flex w-full min-w-0 items-stretch gap-2 sm:w-auto sm:items-center">
                {hasPrev ? (
                  <Link href={q(page - 1)} className={pagerBtn}>
                    ← Previous
                  </Link>
                ) : (
                  <span className={pagerDisabled}>← Previous</span>
                )}
                {hasNext ? (
                  <Link href={q(page + 1)} className={pagerBtn}>
                    Next →
                  </Link>
                ) : (
                  <span className={pagerDisabled}>Next →</span>
                )}
              </div>
            </div>

            {users.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500 md:hidden">No accounts on this page.</div>
            ) : (
              <ul className="divide-y divide-slate-100 md:hidden">
                {users.map((u) => {
                  const email = u.email ?? "";
                  const meta = u.user_metadata as Record<string, unknown> | undefined;
                  const role = roleLabel(email || undefined, owner, u.app_metadata);
                  const shortId = u.id.length > 12 ? `${u.id.slice(0, 8)}…` : u.id;
                  const canPromote = Boolean(email && role === "Customer");
                  const canDemote = Boolean(email && role === "Staff admin");
                  const nameCell = displayName(meta, email);

                  return (
                    <li key={u.id} className="px-4 py-4">
                      <div className="flex flex-col gap-3">
                        <div className="min-w-0 flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900" title={email || undefined}>
                              {email || <span className="font-normal text-slate-400">No email</span>}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-600">
                              {nameCell === "—" ? <span className="text-slate-400">—</span> : nameCell}
                              <span className="mx-1.5 text-slate-300">·</span>
                              <span className="font-mono text-slate-500" title={u.id}>
                                {shortId}
                              </span>
                            </p>
                          </div>
                          <AccessBadge role={role} />
                        </div>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold text-slate-500">Joined</dt>
                            <dd>{fmtWhen(u.created_at)}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-500">Last sign-in</dt>
                            <dd>{fmtWhen(u.last_sign_in_at)}</dd>
                          </div>
                        </dl>
                        <div className="flex flex-wrap gap-2">
                          {canPromote ? (
                            <form action={promoteAdminStaff} className="min-w-0 flex-1 sm:flex-none">
                              <input type="hidden" name="email" value={email} />
                              <button type="submit" className={`${btnPrimary} h-11 w-full min-h-[44px] sm:h-9 sm:min-h-0`}>
                                Make admin
                              </button>
                            </form>
                          ) : null}
                          {canDemote ? (
                            <form action={demoteAdminStaff} className="min-w-0 flex-1 sm:flex-none">
                              <input type="hidden" name="email" value={email} />
                              <button type="submit" className={`${btnDanger} h-11 w-full min-h-[44px] sm:h-9 sm:min-h-0`}>
                                Remove admin
                              </button>
                            </form>
                          ) : null}
                          {role === "Owner" ? (
                            <span className="inline-flex min-h-[44px] items-center text-xs font-medium text-slate-400 sm:min-h-0">—</span>
                          ) : null}
                          {!canPromote && !canDemote && role !== "Owner" && !email ? (
                            <span className="text-xs text-slate-400">—</span>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[52rem] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="whitespace-nowrap px-4 py-3">Email</th>
                    <th className="whitespace-nowrap px-4 py-3">Display</th>
                    <th className="whitespace-nowrap px-4 py-3">User ID</th>
                    <th className="whitespace-nowrap px-4 py-3">Joined</th>
                    <th className="whitespace-nowrap px-4 py-3">Last sign-in</th>
                    <th className="whitespace-nowrap px-4 py-3">Access</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                        No accounts on this page.
                      </td>
                    </tr>
                  ) : (
                    users.map((u, rowIdx) => {
                      const email = u.email ?? "";
                      const meta = u.user_metadata as Record<string, unknown> | undefined;
                      const role = roleLabel(email || undefined, owner, u.app_metadata);
                      const shortId = u.id.length > 12 ? `${u.id.slice(0, 8)}…` : u.id;
                      const canPromote = Boolean(email && role === "Customer");
                      const canDemote = Boolean(email && role === "Staff admin");
                      const nameCell = displayName(meta, email);
                      const zebra = rowIdx % 2 === 1 ? "bg-slate-50/40" : "bg-white";

                      return (
                        <tr key={u.id} className={`${zebra} transition hover:bg-blue-50/40`}>
                          <td className="max-w-[13rem] truncate px-4 py-3 font-semibold text-slate-900" title={email || undefined}>
                            {email || <span className="font-normal text-slate-400">No email</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {nameCell === "—" ? <span className="text-slate-400">—</span> : nameCell}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500" title={u.id}>
                            {shortId}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtWhen(u.created_at)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtWhen(u.last_sign_in_at)}</td>
                          <td className="px-4 py-3">
                            <AccessBadge role={role} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              {canPromote ? (
                                <form action={promoteAdminStaff} className="inline">
                                  <input type="hidden" name="email" value={email} />
                                  <button type="submit" className={`${btnPrimary} h-9`}>
                                    Make admin
                                  </button>
                                </form>
                              ) : null}
                              {canDemote ? (
                                <form action={demoteAdminStaff} className="inline">
                                  <input type="hidden" name="email" value={email} />
                                  <button type="submit" className={`${btnDanger} h-9`}>
                                    Remove admin
                                  </button>
                                </form>
                              ) : null}
                              {role === "Owner" ? (
                                <span className="inline-flex h-9 items-center text-xs font-medium text-slate-400">—</span>
                              ) : null}
                              {!canPromote && !canDemote && role !== "Owner" && !email ? (
                                <span className="text-xs text-slate-400">—</span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quick actions — same button styles as table */}
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Quick add / remove by email</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Grant access</h3>
                <p className="mt-1 text-xs text-slate-600">For someone not on this page yet (must have a shop account).</p>
                <form action={promoteAdminStaff} className="mt-3 space-y-3">
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="colleague@example.com"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <button type="submit" className={`${btnPrimary} h-10 w-full rounded-xl`}>
                    Grant dashboard access
                  </button>
                </form>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">Revoke access</h3>
                <p className="mt-1 text-xs text-slate-600">They keep their customer login; only /admin is removed.</p>
                <form action={demoteAdminStaff} className="mt-3 space-y-3">
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="email@example.com"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                  <button type="submit" className={`${btnDanger} h-10 w-full rounded-xl`}>
                    Revoke dashboard access
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
