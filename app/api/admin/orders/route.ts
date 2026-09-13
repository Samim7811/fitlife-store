import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("orders")
      .select(`
        id,
        tracking_number,
        customer_name,
        customer_phone:phone,
        address,
        city,
        state,
        pincode,
        landmark,
        product_name,
        quantity,
        unit_price,
        total_amount,
        payment_method,
        status,
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
          message: error.message,
          orders: []
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: data ?? []
    });
  } catch (error) {
    console.error("Unexpected admin orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
        orders: []
      },
      { status: 500 }
    );
  }
}
