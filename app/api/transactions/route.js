import { NextResponse } from "next/server"
import { connectDB } from "../loginuser/route"
import Invoices from "@/app/schema/invoices"
import Transaction from "@/app/schema/Transaction"

function parseCleanAmount(val) {
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9.-]+/g, "");
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Number(num.toFixed(2));
}

export async function POST() {
    try {
        await connectDB()
        const unpostedInvoices = await Invoices.find({ isPosted: { $ne: true } });
        if (unpostedInvoices.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No new invoices to automate.",
                processedCount: 0,
            });
        }

        let processedCount = 0;

        for (const inv of unpostedInvoices) {
            const total = parseCleanAmount(inv.Total);
            const cgst = parseCleanAmount(inv.CGST);
            const sgst = parseCleanAmount(inv.SGST);
            const igst = parseCleanAmount(inv.IGST);

            // Base amount = Total minus taxes
            const totalTax = Number((cgst + sgst + igst).toFixed(2));
            const baseAmount = Number((total - totalTax).toFixed(2));

            // Build double-entry list
            const entries = [];

            // CREDIT: Liability owed to Merchant (Total)
            entries.push({
                accountName: `Accounts Payable - ${inv.merchant_name || "Unknown Merchant"}`,
                entryType: "CREDIT",
                amount: total,
            });

            // DEBIT: Expense / Purchases (Base Amount)
            entries.push({
                accountName: "Purchases",
                entryType: "DEBIT",
                amount: baseAmount,
            });

            // DEBIT: Input Tax Credits
            if (cgst > 0) entries.push({ accountName: "Added CGST", entryType: "DEBIT", amount: cgst });
            if (sgst > 0) entries.push({ accountName: "Added SGST", entryType: "DEBIT", amount: sgst });
            if (igst > 0) entries.push({ accountName: "Added IGST", entryType: "DEBIT", amount: igst });

            // Verification: Ensure Debits == Credits
            let totalDr = 0;
            let totalCr = 0;
            entries.forEach((e) => {
                if (e.entryType === "DEBIT") totalDr += e.amount;
                if (e.entryType === "CREDIT") totalCr += e.amount;
            });

            if (Math.abs(totalDr - totalCr) > 0.05) {
                console.warn(`Skipping invoice ${inv._id}: Debits (${totalDr}) != Credits (${totalCr})`);
                continue;
            }

            // 3. Save the Transaction
            const transaction = await Transaction.create({
                invoiceId: inv._id,
                transactionDate: inv.Bill_Date ? new Date(inv.Bill_Date) : new Date(),
                description: `Auto-Entry: Bill ${inv.Bill_No || "N/A"} from ${inv.merchant_name || "Unknown"}`,
                entries,
            });

            // 4. Mark the invoice as posted
            inv.isPosted = true;
            inv.transactionId = transaction._id;
            await inv.save();

            processedCount++;
        }
        return NextResponse.json({
            success: true, message: `Successfully automated accounting for ${processedCount} invoice(s).`, processedCount,
        }, { status: 200 });
    } catch (error) {
        console.log("Accounting Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const transactions = await Transaction.find({}).sort({ transactionDate: -1 });
        return NextResponse.json({ success: true, data: transactions });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}