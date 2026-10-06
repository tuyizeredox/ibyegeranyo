import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  confirmPayment,
  rejectPayment,
  getPaymentById,
} from "@/lib/db";
import { isGatewayPayment, notifyPaymentApproved, reconcilePayment } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentId, action } = body;

    if (!paymentId || !action) {
      return NextResponse.json(
        { error: "Payment ID and action are required" },
        { status: 400 }
      );
    }

    if (action === "confirm") {
      const payment = await getPaymentById(paymentId);
      if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      // Gateway payments are approved only if iTechPay confirms them.
      if (isGatewayPayment(payment)) {
        const result = await reconcilePayment(paymentId, "admin");
        if (result.status !== "confirmed") {
          return NextResponse.json(
            { error: `iTechPay has not confirmed this payment (${result.detail || result.status})` },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true, message: "Payment verified and confirmed" });
      }

      const result = await confirmPayment(paymentId, admin.id);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to confirm payment" },
          { status: 400 }
        );
      }

      if (!result.alreadyConfirmed) await notifyPaymentApproved(paymentId);

      return NextResponse.json({
        success: true,
        message: "Payment confirmed successfully",
      });
    }

    if (action === "reject") {
      const result = await rejectPayment(paymentId);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to reject payment" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Payment rejected",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
