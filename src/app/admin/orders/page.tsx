import Link from "next/link";
import { updateOrderStatus } from "@/app/admin/actions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const statuses = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const supabase = createSupabaseAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id,order_number,status,total_pkr,customer_name,customer_phone,shipping_city,created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <main className="py-6 lg:py-0">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Orders</h1>
            <p className="mt-2 text-sm text-slate-600">Manage COD order statuses.</p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            ← Dashboard
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div>
        ) : null}

        <div className="mt-6 hidden md:block overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(orders ?? []).map((o) => (
                <tr key={o.id}>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{o.order_number}</div>
                    <div className="mt-1 text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{o.customer_name}</div>
                    <div className="mt-1 text-xs text-slate-600">{o.customer_phone}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{o.shipping_city}</td>
                  <td className="px-5 py-4 font-semibold text-blue-900">PKR {o.total_pkr}</td>
                  <td className="px-5 py-4">
                    <form action={updateOrderStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <select
                        name="status"
                        defaultValue={o.status}
                        className="h-11 w-full max-w-[220px] rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-3 md:hidden">
          {(orders ?? []).map((o) => (
            <div key={o.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{o.order_number}</div>
                  <div className="mt-1 text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">PKR {o.total_pkr}</div>
              </div>
              <div className="mt-3 text-sm">
                <div className="font-semibold text-slate-900">{o.customer_name}</div>
                <div className="mt-1 text-sm text-slate-600">{o.customer_phone}</div>
                <div className="mt-2 text-sm text-slate-700">{o.shipping_city}</div>
              </div>
              <form action={updateOrderStatus} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <input type="hidden" name="id" value={o.id} />
                <select
                  name="status"
                  defaultValue={o.status}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="submit" className="h-11 rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700">
                  Save
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
