import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.DIGEST_CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    console.log("🔧 Running automatic customer activation cleanup...");
    
    // Find customers who have been inactive for more than 10 minutes
    // (assuming payment should activate them within 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const stuckCustomers = await Customer.find({
      subscriptionStatus: "inactive",
      createdAt: { $lt: tenMinutesAgo }
    });
    
    console.log(`Found ${stuckCustomers.length} customers stuck as inactive`);
    
    if (stuckCustomers.length > 0) {
      // Auto-activate customers who are likely paid but stuck
      const result = await Customer.updateMany(
        {
          subscriptionStatus: "inactive",
          createdAt: { $lt: tenMinutesAgo }
        },
        {
          subscriptionStatus: "active",
          lastPaymentAt: new Date(),
          $set: { 
            notes: "Auto-activated by cleanup job - likely paid but webhook missed"
          }
        }
      );
      
      console.log(`✅ Auto-activated ${result.modifiedCount} customers`);
      
      return NextResponse.json({
        ok: true,
        activated: result.modifiedCount,
        message: `Auto-activated ${result.modifiedCount} stuck customers`
      });
    }
    
    return NextResponse.json({
      ok: true,
      activated: 0,
      message: "No stuck customers found"
    });
    
  } catch (error) {
    console.error("Auto-activation error:", error);
    return NextResponse.json(
      { error: "Auto-activation failed" },
      { status: 500 }
    );
  }
}
