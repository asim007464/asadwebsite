import Link from "next/link";
import { RegisterForm } from "@/components/account/RegisterForm";

export const metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-var(--site-header-height)-6rem)] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Register to save details and track orders when you enable customer profiles.</p>
        <RegisterForm />
      </div>
      <p className="mt-8 text-center text-sm text-slate-600">
        <Link href="/" className="font-semibold text-blue-700 hover:text-blue-800">
          ← Back to shop
        </Link>
      </p>
    </main>
  );
}
