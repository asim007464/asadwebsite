import Link from "next/link";
import { LoginForm } from "@/components/account/LoginForm";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-var(--site-header-height)-6rem)] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Use your email and password to access your account.</p>
        <LoginForm />
      </div>
      <p className="mt-8 text-center text-sm text-slate-600">
        <Link href="/" className="font-semibold text-blue-700 hover:text-blue-800">
          ← Back to shop
        </Link>
      </p>
    </main>
  );
}
