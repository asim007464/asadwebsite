"use server";

import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendOrderEmail } from "@/lib/email";

const cartItemSchema = z.object({
  variantId: z.string().uuid(),
  productName: z.string().min(1),
  variantTitle: z.string().min(1),
  sku: z.string().min(1),
  unitPricePkr: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

const checkoutSchema = z.object({
  customer_name: z.string().min(2),
  customer_phone: z.string().min(8),
  customer_email: z.string().email().optional().or(z.literal("")),
  shipping_address1: z.string().min(5),
  shipping_address2: z.string().optional().or(z.literal("")),
  shipping_city: z.string().min(2),
  shipping_province: z.string().optional().or(z.literal("")),
  shipping_postal_code: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  payment_method: z.enum(["cod", "card", "jazzcash"]).default("cod"),
  card_last4: z.string().regex(/^\d{4}$/).optional().or(z.literal("")),
  card_holder: z.string().optional().or(z.literal("")),
  jazzcash_phone: z.string().optional().or(z.literal("")),
  jazzcash_reference: z.string().optional().or(z.literal("")),
  items: z.array(cartItemSchema).min(1),
});

function makeOrderNumber() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ASD-${y}${m}${day}-${rand}`;
}

export async function createOrder(payload: unknown) {
  const input = checkoutSchema.parse(payload);
  const subtotal = input.items.reduce((s, it) => s + it.unitPricePkr * it.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const supabase = createSupabaseAdminClient();
  const order_number = makeOrderNumber();

  let paymentNote = "";
  if (input.payment_method === "card") {
    if (!input.card_last4 || !/^\d{4}$/.test(input.card_last4)) {
      throw new Error("Please enter a valid card number (we only store the last 4 digits).");
    }
    paymentNote = `Payment: Card • Last4: ${input.card_last4}${input.card_holder ? ` • Name: ${input.card_holder}` : ""}`;
  }
  if (input.payment_method === "jazzcash") {
    const phone = (input.jazzcash_phone || "").trim();
    const ref = (input.jazzcash_reference || "").trim();
    if (phone.length < 8 || ref.length < 3) {
      throw new Error("Please enter JazzCash phone number and reference/transaction id.");
    }
    paymentNote = `Payment: JazzCash • Phone: ${phone} • Ref: ${ref}`;
  }

  const notesFull = [input.notes || "", paymentNote].map((s) => s.trim()).filter(Boolean).join("\n");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number,
      status: "pending",
      payment_method: input.payment_method,
      currency: "PKR",
      subtotal_pkr: subtotal,
      shipping_pkr: shipping,
      total_pkr: total,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email || null,
      shipping_address1: input.shipping_address1,
      shipping_address2: input.shipping_address2 || null,
      shipping_city: input.shipping_city,
      shipping_province: input.shipping_province || null,
      shipping_postal_code: input.shipping_postal_code || null,
      notes: notesFull,
    })
    .select("id,order_number,total_pkr")
    .single();

  if (orderError) throw new Error(orderError.message);

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((it) => ({
      order_id: order.id,
      variant_id: it.variantId,
      product_name: it.productName,
      variant_title: it.variantTitle,
      sku: it.sku,
      unit_price_pkr: it.unitPricePkr,
      quantity: it.quantity,
      line_total_pkr: it.unitPricePkr * it.quantity,
    })),
  );
  if (itemsError) throw new Error(itemsError.message);

  // Email (Nodemailer). Email errors should not block order placement.
  try {
    const address = [input.shipping_address1, input.shipping_address2, input.shipping_city, input.shipping_province, input.shipping_postal_code]
      .filter(Boolean)
      .join(", ");

    const itemsHtml = input.items
      .map(
        (it) =>
          `<tr><td style="padding:6px 0">${it.productName}<br/><span style="color:#666;font-size:12px">${it.variantTitle} (SKU: ${it.sku})</span></td><td style="text-align:right;padding:6px 0">${it.quantity}</td><td style="text-align:right;padding:6px 0">PKR ${it.unitPricePkr}</td></tr>`,
      )
      .join("");

    await sendOrderEmail({
      subject: `New order ${order.order_number} (PKR ${order.total_pkr})`,
      to: input.customer_email ? input.customer_email : null,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.4">
          <h2 style="margin:0 0 8px">New Order: ${order.order_number}</h2>
          <p style="margin:0 0 12px;color:#444">Payment: ${input.payment_method.toUpperCase()} • Total: <b>PKR ${order.total_pkr}</b></p>
          <h3 style="margin:16px 0 8px">Customer</h3>
          <p style="margin:0;color:#444">
            <b>${input.customer_name}</b><br/>
            Phone: ${input.customer_phone}<br/>
            ${input.customer_email ? `Email: ${input.customer_email}<br/>` : ""}
            Address: ${address}
          </p>
          <h3 style="margin:16px 0 8px">Items</h3>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px 0">Item</th>
                <th style="text-align:right;border-bottom:1px solid #ddd;padding:8px 0">Qty</th>
                <th style="text-align:right;border-bottom:1px solid #ddd;padding:8px 0">Unit</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          ${notesFull ? `<p style="margin:16px 0 0;color:#444"><b>Notes:</b><br/>${notesFull.replaceAll("\n", "<br/>")}</p>` : ""}
        </div>
      `,
    });
  } catch {
    // Ignore email errors (still keep order)
  }

  return { orderId: order.id, orderNumber: order.order_number, totalPkr: order.total_pkr };
}

