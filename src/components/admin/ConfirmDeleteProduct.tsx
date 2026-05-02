"use client";

import { deleteProduct } from "@/app/admin/actions";

export function ConfirmDeleteProduct({ id }: { id: string }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(e) => {
        if (!confirm("Delete this product and all its variants?")) e.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-800 hover:bg-red-100"
      >
        Delete
      </button>
    </form>
  );
}
