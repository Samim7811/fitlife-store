import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
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
        tracking_number,
        admin_note,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin orders error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load orders.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: data ?? [],
    });
  } catch (error) {
    console.error("Unexpected admin orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
