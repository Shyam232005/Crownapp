import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import JournalEntry from "@/models/JournalEntry";
import Ledger from "@/models/Ledger";
import CompanyLink from "@/models/CompanyLink";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Authentication and Tenancy Helper
 * Ensures callers only access companies they own or are authorized to audit.
 */
async function authenticateRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("crown_session")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Authorization Checker
 * CA or CA-Staff can ONLY access company data if CompanyLink.status === 'CONNECTED'
 */
async function authorizeCompanyAccess(user, targetCompanyId) {
  if (user.isSuperAdmin || user.role === "Admin" || user.role === "ADMIN") {
    return true;
  }

  const userCompanyId = user.companyId || user.userId;
  // If user is Owner or Employee of this company
  if (userCompanyId && userCompanyId.toString() === targetCompanyId.toString()) {
    return true;
  }

  // If user is CA or CA-Staff
  const isCA = user.role === "CA";
  const isStaff =
    user.role === "CA-Employee" ||
    user.role === "CA_STAFF" ||
    user.role === "CAStaff";

  if (isCA || isStaff) {
    const caFirmId = user.caFirmId || user.userId;
    const link = await CompanyLink.findOne({
      companyId: new mongoose.Types.ObjectId(targetCompanyId),
      caFirmId: new mongoose.Types.ObjectId(caFirmId)
    });

    if (!link || link.status !== "CONNECTED") {
      return false;
    }
    return true;
  }

  return false;
}

export async function GET(request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") || "all").toLowerCase();
    const queryCompanyId = searchParams.get("companyId") || searchParams.get("clientId");

    const targetCompanyId = queryCompanyId || user.companyId || user.userId;
    if (!targetCompanyId) {
      return NextResponse.json(
        { success: false, error: "Target companyId is required." },
        { status: 400 }
      );
    }

    // Zero-Leak Authorization Gate
    const isAuthorized = await authorizeCompanyAccess(user, targetCompanyId);
    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Company access has not been approved by Owner."
        },
        { status: 403 }
      );
    }

    const companyObjectId = new mongoose.Types.ObjectId(targetCompanyId);

    // 1. DYNAMIC TRIAL BALANCE
    if (type === "trial-balance") {
      const journalEntries = await JournalEntry.find({
        companyId: companyObjectId,
        status: { $ne: "VOID" }
      }).lean();

      const accountMap = {};

      journalEntries.forEach((je) => {
        je.entries.forEach((entry) => {
          const accName = entry.accountName;
          if (!accountMap[accName]) {
            accountMap[accName] = {
              accountName: accName,
              accountType: entry.accountType,
              totalDebit: 0,
              totalCredit: 0
            };
          }
          if (entry.type === "DEBIT") {
            accountMap[accName].totalDebit += entry.amount;
          } else if (entry.type === "CREDIT") {
            accountMap[accName].totalCredit += entry.amount;
          }
        });
      });

      let totalDebitBalance = 0;
      let totalCreditBalance = 0;

      const trialBalanceAccounts = Object.values(accountMap).map((acc) => {
        let debitBalance = 0;
        let creditBalance = 0;

        if (["ASSET", "EXPENSE"].includes(acc.accountType)) {
          const net = acc.totalDebit - acc.totalCredit;
          if (net >= 0) {
            debitBalance = net;
          } else {
            creditBalance = Math.abs(net);
          }
        } else {
          // LIABILITY, EQUITY, REVENUE
          const net = acc.totalCredit - acc.totalDebit;
          if (net >= 0) {
            creditBalance = net;
          } else {
            debitBalance = Math.abs(net);
          }
        }

        totalDebitBalance += debitBalance;
        totalCreditBalance += creditBalance;

        return {
          accountName: acc.accountName,
          accountType: acc.accountType,
          totalDebit: acc.totalDebit,
          totalCredit: acc.totalCredit,
          debitBalance: Math.round(debitBalance * 100) / 100,
          creditBalance: Math.round(creditBalance * 100) / 100
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          accounts: trialBalanceAccounts,
          totalDebits: Math.round(totalDebitBalance * 100) / 100,
          totalCredits: Math.round(totalCreditBalance * 100) / 100,
          isBalanced: Math.abs(totalDebitBalance - totalCreditBalance) < 0.01
        }
      });
    }

    // 2. DYNAMIC LEDGERS (Per Account Summary)
    if (type === "ledger") {
      const accountNameParam = searchParams.get("accountName");
      const matchStage = { companyId: companyObjectId, status: { $ne: "VOID" } };

      const journalEntries = await JournalEntry.find(matchStage)
        .sort({ date: 1, createdAt: 1 })
        .lean();

      const ledgers = {};

      journalEntries.forEach((je) => {
        je.entries.forEach((entry) => {
          const acc = entry.accountName;
          if (accountNameParam && acc.toLowerCase() !== accountNameParam.toLowerCase()) {
            return;
          }

          if (!ledgers[acc]) {
            ledgers[acc] = {
              accountName: acc,
              accountType: entry.accountType,
              totalDebit: 0,
              totalCredit: 0,
              entries: []
            };
          }

          if (entry.type === "DEBIT") {
            ledgers[acc].totalDebit += entry.amount;
          } else {
            ledgers[acc].totalCredit += entry.amount;
          }

          ledgers[acc].entries.push({
            journalId: je._id,
            date: je.date,
            referenceId: je.referenceId,
            narration: je.narration,
            type: entry.type,
            amount: entry.amount
          });
        });
      });

      const result = Object.values(ledgers).map((led) => {
        const net =
          ["ASSET", "EXPENSE"].includes(led.accountType)
            ? led.totalDebit - led.totalCredit
            : led.totalCredit - led.totalDebit;
        return {
          ...led,
          netBalance: Math.round(net * 100) / 100
        };
      });

      return NextResponse.json({ success: true, data: result });
    }

    // 3. GST TAX BREAKDOWN BY BRACKETS (5%, 12%, 18%)
    if (type === "gst-summary") {
      const journalEntries = await JournalEntry.find({
        companyId: companyObjectId,
        status: { $ne: "VOID" }
      }).lean();

      const brackets = {
        5: { rate: 5, taxableAmount: 0, inputTax: 0, outputTax: 0, netLiability: 0 },
        12: { rate: 12, taxableAmount: 0, inputTax: 0, outputTax: 0, netLiability: 0 },
        18: { rate: 18, taxableAmount: 0, inputTax: 0, outputTax: 0, netLiability: 0 },
        28: { rate: 28, taxableAmount: 0, inputTax: 0, outputTax: 0, netLiability: 0 }
      };

      journalEntries.forEach((je) => {
        const rate = je.gstRate || 0;
        if (brackets[rate]) {
          const isSale = je.entries.some(
            (e) => e.accountType === "REVENUE" && e.type === "CREDIT"
          );
          const isPurchase = je.entries.some(
            (e) => (e.accountType === "EXPENSE" || e.accountName === "Inventory") && e.type === "DEBIT"
          );

          const taxTotal =
            (je.taxDetails?.cgst || 0) +
            (je.taxDetails?.sgst || 0) +
            (je.taxDetails?.igst || 0);

          if (isSale) {
            brackets[rate].outputTax += taxTotal;
          } else if (isPurchase) {
            brackets[rate].inputTax += taxTotal;
          }
        }
      });

      let totalOutputTax = 0;
      let totalInputTax = 0;

      Object.values(brackets).forEach((b) => {
        b.netLiability = Math.round((b.outputTax - b.inputTax) * 100) / 100;
        totalOutputTax += b.outputTax;
        totalInputTax += b.inputTax;
      });

      return NextResponse.json({
        success: true,
        data: {
          brackets: Object.values(brackets),
          totalOutputTax: Math.round(totalOutputTax * 100) / 100,
          totalInputTax: Math.round(totalInputTax * 100) / 100,
          totalNetLiability: Math.round((totalOutputTax - totalInputTax) * 100) / 100
        }
      });
    }

    // 4. JOURNAL ENTRIES LIST (Default)
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search");
    const filter = { companyId: companyObjectId };

    if (search) {
      filter.$or = [
        { referenceId: new RegExp(search, "i") },
        { narration: new RegExp(search, "i") },
        { "entries.accountName": new RegExp(search, "i") }
      ];
    }

    const journalEntries = await JournalEntry.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: journalEntries
    });
  } catch (error) {
    console.error("GET Accounting Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch accounting records." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await authenticateRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const targetCompanyId = body.companyId || user.companyId || user.userId;
    if (!targetCompanyId) {
      return NextResponse.json(
        { success: false, error: "Target companyId is required." },
        { status: 400 }
      );
    }

    const isAuthorized = await authorizeCompanyAccess(user, targetCompanyId);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Unauthorized company access." },
        { status: 403 }
      );
    }

    const { referenceId, date, narration, entries, gstRate, taxDetails } = body;

    if (!referenceId || !entries || !Array.isArray(entries) || entries.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid double-entry journal entry requires a referenceId and at least 2 entries."
        },
        { status: 400 }
      );
    }

    // Strict Double-Entry Verification
    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      const amt = Number(entry.amount);
      if (!amt || amt <= 0) {
        return NextResponse.json(
          { success: false, error: `Invalid amount for account ${entry.accountName}` },
          { status: 400 }
        );
      }
      if (entry.type === "DEBIT") totalDebit += amt;
      else if (entry.type === "CREDIT") totalCredit += amt;
      else {
        return NextResponse.json(
          { success: false, error: `Entry type must be DEBIT or CREDIT` },
          { status: 400 }
        );
      }
    }

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      return NextResponse.json(
        {
          success: false,
          error: `Debits and Credits must balance. Debits: ₹${totalDebit.toFixed(
            2
          )}, Credits: ₹${totalCredit.toFixed(2)}`
        },
        { status: 400 }
      );
    }

    const newJournal = new JournalEntry({
      companyId: new mongoose.Types.ObjectId(targetCompanyId),
      date: date ? new Date(date) : new Date(),
      referenceId: referenceId.trim(),
      narration: narration || "",
      entries: entries.map((e) => ({
        accountName: e.accountName.trim(),
        accountType: e.accountType || "ASSET",
        type: e.type,
        amount: Number(e.amount)
      })),
      gstRate: Number(gstRate) || 0,
      taxDetails: taxDetails || { cgst: 0, sgst: 0, igst: 0 },
      createdBy: new mongoose.Types.ObjectId(user.userId),
      creatorModel: user.role === "Employee" ? "Employee" : "Owner"
    });

    await newJournal.save();

    // Sync / Upsert Ledger records
    for (const e of entries) {
      await Ledger.findOneAndUpdate(
        {
          companyId: new mongoose.Types.ObjectId(targetCompanyId),
          accountName: e.accountName.trim()
        },
        {
          $setOnInsert: {
            accountType: e.accountType || "ASSET",
            openingBalance: 0
          },
          $inc: {
            totalDebit: e.type === "DEBIT" ? Number(e.amount) : 0,
            totalCredit: e.type === "CREDIT" ? Number(e.amount) : 0
          }
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newJournal,
        message: "Journal entry posted successfully with balanced debits and credits."
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Accounting Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record journal entry." },
      { status: 500 }
    );
  }
}
