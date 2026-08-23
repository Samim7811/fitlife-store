import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const ALLOWED_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderId =
      typeof body.orderId === "string"
        ? body.orderId.trim().toUpperCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.replace(/\D/g, "")
        : "";

    if (!orderId || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID and mobile number are required.",
        },
        { status: 400 }
      );
    }

    if (!/^FIT-\d{4}-\d{6}$/.test(orderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid Order ID.",
        },
        { status: 400 }
      );
    }

    if (phone.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        tracking_number,
        customer_name,
        phone,
        address,
        city,
        state,
        pincode,
        product_name,
        offer_type,
        quantity,
        amount,
        payment_method,
        status,
        created_at,
        updated_at
        `
      )
      .eq("tracking_number", orderId)
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      console.error("Order tracking error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to track order right now.",
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found. Check your Order ID and mobile number.",
        },
        { status: 404 }
      );
    }

    const currentStatus = ALLOWED_STATUSES.includes(order.status)
      ? order.status
      : "Pending";

    const { data: history, error: historyError } = await supabaseAdmin
      .from("order_status_history")
      .select("status, note, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    if (historyError) {
      console.error("Order history error:", historyError);
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.tracking_number,
        customerName: order.customer_name,
        product: order.product_name,
        offerType: order.offer_type,
        quantity: order.quantity,
        amount: order.amount,
        paymentMethod: order.payment_method,
        status: currentStatus,
        address: order.address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        history: history || [],
      },
    });
  } catch (error) {
    console.error("Unexpected tracking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
