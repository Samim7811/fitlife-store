import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const ALLOWED_STATUSES = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Return Requested",
  "Returned",
];

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const orderId = String(body.orderId || "").trim();
    const status = String(body.status || "").trim();
    const note = body.note ? String(body.note).trim() : null;

    if (!orderId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID and status are required.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    const { data: existingOrder, error: findError } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (findError || !existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status,
        admin_note: note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select(`
        id,
        tracking_number,
        customer_name,
        phone,
        product_name,
        offer_type,
        quantity,
        amount,
        payment_method,
        status,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error("Status update error:", updateError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to update order status.",
        },
        { status: 500 }
      );
    }

    const { error: historyError } = await supabaseAdmin
      .from("order_status_history")
      .insert({
        order_id: existingOrder.id,
        status,
        note,
      });

    if (historyError) {
      console.error("History insert error:", historyError);
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Unexpected status update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
