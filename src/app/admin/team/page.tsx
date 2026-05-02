import Link from "next/link";
import { demoteAdminStaff, promoteAdminStaff } from "@/app/admin/actions";
import { assertAdminOwner, getAdminOwnerEmail, normAdminEmail } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function staffFlagOn(meta: Record<string, unknown> | undefined): boolean {
  const v = meta?.admin_panel;
  return v === true || v === "true";
}

async function listStaffAdminEmails(): Promise<string[]> {
  const admin = createSupabaseAdminClient();
  const out: string[] = [];
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    const users = data.users ?? [];
    for (const u of users) {
      if (u.email && staffFlagOn(u.app_metadata as Record<string, unknown> | undefined)) {
        out.push(normAdminEmail(u.email));
      }
    }
    if (users.length < 200) break;
    page += 1;
    if (page > 50) break;
  }
  return [...new Set(out)].sort();
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

  const owner = getAdminOwnerEmail();
  const staffEmails = (await listStaffAdminEmails()).filter((e) => e !== owner);

  const errMsg =
    err === "invalid-email"
      ? "Enter a valid email."
      : err === "no-account"
        ? "No storefront account exists for that email — they must register first."
        : err === "cannot-demote-owner"
          ? "The owner account cannot be removed from admin."
          : err
            ? `Something went wrong${err.length < 120 ? `: ${err}` : "."}`
            : "";

  const noticeMsg =
    notice === "promoted"
      ? "Staff admin access granted. They may need to sign out and back in for it to apply everywhere."
      : notice === "demoted"
        ? "Staff admin access removed."
        : notice === "owner-already"
          ? "That address is already the owner."
          : "";

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin team</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Owner <span className="font-semibold text-slate-800">{owner}</span> can grant dashboard access to other storefront accounts.
              Staff admins cannot add or remove admins.
            </p>
          </div>
          <Link href="/admin" className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {errMsg ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">{errMsg}</div>
        ) : null}
        {noticeMsg ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            {noticeMsg}
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Grant admin</h2>
            <p className="mt-2 text-sm text-slate-600">Use the same email they use to sign in on the shop (Supabase account).</p>
            <form action={promoteAdminStaff} className="mt-4 space-y-3">
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="colleague@example.com"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Grant dashboard access
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Revoke admin</h2>
            <p className="mt-2 text-sm text-slate-600">Removes /admin access only; they keep their customer account.</p>
            <form action={demoteAdminStaff} className="mt-4 space-y-3">
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="email to revoke"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-red-200 bg-red-50 text-sm font-semibold text-red-800 hover:bg-red-100"
              >
                Revoke dashboard access
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Staff admins</div>
          {staffEmails.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No staff admins yet (paginated scan — very large projects may trim the list).</p>
          ) : (
            <ul className="mt-3 list-inside list-disc text-sm font-medium text-slate-800">
              {staffEmails.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
