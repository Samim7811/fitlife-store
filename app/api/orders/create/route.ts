import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

const PRODUCT_NAME = "5 in 1 Home Fitness Kit";

function generateOrderId() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `FIT-${year}-${random}`;
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const customerName = clean(body.customerName);
    const phone = clean(body.phone);
    const address = clean(body.address);
    const city = clean(body.city);
    const state = clean(body.state);
    const pincode = clean(body.pincode);
    const landmark = clean(body.landmark);

    const offerType = body.offerType === "bundle" ? "bundle" : "single";

    const quantity = offerType === "bundle" ? 2 : 1;
    const amount = offerType === "bundle" ? 1698 : 949;

    if (!customerName || !phone || !address || !city || !state || !pincode) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required fields.",
        },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 6-digit pincode.",
        },
        { status: 400 }
      );
    }

    let orderId = generateOrderId();

    let { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("tracking_number", orderId)
      .maybeSingle();

    while (existingOrder) {
      orderId = generateOrderId();

      const result = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("tracking_number", orderId)
        .maybeSingle();

      existingOrder = result.data;
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: null,
        customer_name: customerName,
        phone: phoneDigits,
        address,
        city,
        state,
        pincode,
        product_name: PRODUCT_NAME,
        offer_type: offerType,
        quantity,
        amount,
        payment_method: "COD",
        status: "Pending",
        tracking_number: orderId,
        admin_note: landmark
          ? `Landmark: ${landmark}`
          : null,
      })
      .select(
        "id, customer_name, phone, product_name, quantity, amount, payment_method, status, tracking_number, created_at"
      )
      .single();

    if (error) {
      console.error("Order creation error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Order could not be placed. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      order: {
        id: order.id,
        orderId: order.tracking_number,
        customerName: order.customer_name,
        product: order.product_name,
        quantity: order.quantity,
        amount: order.amount,
        paymentMethod: order.payment_method,
        status: order.status,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    console.error("Unexpected order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
