import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { getSessionUser } from "@/lib/rbac";
import Stock from "@/models/Stock";
import Transaction from "@/models/Transaction";
import CRMDeal from "@/models/CRMDeal";
import Employee from "@/models/Employee";
import Task from "@/models/Task";
import Leave from "@/models/Leave";
import Attendance from "@/models/Attendance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const { user, error, status } = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error }, { status: status || 401 });
    }

    const isOwner = user.role === "Owner" || user.role === "OWNER" || user.isSuperAdmin;
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Department Summary is restricted to Business Owners." },
        { status: 403 }
      );
    }

    const companyId = user.companyId || user.userId;
    if (!companyId) {
      return NextResponse.json({ success: false, error: "Company context missing." }, { status: 400 });
    }

    await connectDB();
    const compObjectId = new mongoose.Types.ObjectId(companyId);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel aggregate queries across all departments
    const [
      // 1. Operations Data
      stocksList,
      todayInwardAgg,
      operationsTasks,
      operationsStaffCount,

      // 2. Sales Data
      salesTransactions,
      todaySalesAgg,
      monthSalesAgg,
      crmDeals,
      salesTasks,
      salesStaffCount,

      // 3. Finance Data
      financeAgg,
      pendingOwnerApprovals,
      pendingCaReviews,
      financeTasks,
      financeStaffCount,

      // 4. HR Data
      totalEmployees,
      departmentStaffCounts,
      pendingLeaves,
      todayAttendancePunches
    ] = await Promise.all([
      // Operations: stocks & items
      Stock.find({ companyId: compObjectId }).sort({ updatedAt: -1 }).limit(10).lean(),
      Stock.aggregate([
        { $match: { companyId: compObjectId, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, totalQty: { $sum: "$quantity" }, count: { $sum: 1 } } }
      ]),
      Task.find({ companyId: compObjectId, department: "OPERATIONS" }).lean(),
      Employee.countDocuments({ companyId: compObjectId, department: "OPERATIONS" }),

      // Sales: Transactions & CRM Deals
      Transaction.find({
        companyId: compObjectId,
        department: "SALES"
      }).sort({ transactionDate: -1 }).limit(10).lean(),
      Transaction.aggregate([
        {
          $match: {
            companyId: compObjectId,
            department: "SALES",
            transactionDate: { $gte: startOfToday }
          }
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        {
          $match: {
            companyId: compObjectId,
            department: "SALES",
            transactionDate: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ]),
      CRMDeal.find({ companyId: compObjectId }).sort({ createdAt: -1 }).lean(),
      Task.find({ companyId: compObjectId, department: "SALES" }).lean(),
      Employee.countDocuments({ companyId: compObjectId, department: "SALES" }),

      // Finance: Income vs Expense & Approval Queues
      Transaction.aggregate([
        { $match: { companyId: compObjectId } },
        { $group: { _id: "$type", total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ]),
      Transaction.countDocuments({
        companyId: compObjectId,
        status: { $in: ["PENDING_OWNER_APPROVAL", "PENDING"] }
      }),
      Transaction.countDocuments({
        companyId: compObjectId,
        status: "PENDING_CA_REVIEW"
      }),
      Task.find({ companyId: compObjectId, department: "FINANCE" }).lean(),
      Employee.countDocuments({ companyId: compObjectId, department: "FINANCE" }),

      // HR: Staffing & Attendance
      Employee.countDocuments({ companyId: compObjectId }),
      Employee.aggregate([
        { $match: { companyId: compObjectId } },
        { $group: { _id: "$department", count: { $sum: 1 } } }
      ]),
      Leave.countDocuments({ companyId: compObjectId, status: "Pending" }),
      Attendance.countDocuments({
        date: now.toISOString().slice(0, 10),
        status: { $in: ["Present", "Half Day"] }
      }).catch(() => 0)
    ]);

    // Format Finance figures
    let totalIncome = 0;
    let totalExpense = 0;
    financeAgg.forEach((group) => {
      const type = (group._id || "").toString().toUpperCase();
      if (["SALES", "INCOME", "ADVANCE_RECEIVED", "COLLECTION", "PAYMENT_IN"].includes(type)) {
        totalIncome += group.total || 0;
      } else if (["PURCHASE", "EXPENSE", "PAYMENT_OUT"].includes(type)) {
        totalExpense += group.total || 0;
      }
    });

    // Format CRM pipeline
    let totalPipelineValue = 0;
    let wonPipelineValue = 0;
    crmDeals.forEach((d) => {
      totalPipelineValue += d.amount || 0;
      if (d.stage === "WON" || d.status === "ACCEPTED") {
        wonPipelineValue += d.amount || 0;
      }
    });

    // Format Department Headcount Map
    const headcountByDept = {
      OPERATIONS: operationsStaffCount || 0,
      SALES: salesStaffCount || 0,
      FINANCE: financeStaffCount || 0,
      HR: 0
    };
    departmentStaffCounts.forEach((d) => {
      const deptName = (d._id || "OPERATIONS").toString().toUpperCase();
      headcountByDept[deptName] = d.count;
    });

    return NextResponse.json({
      success: true,
      data: {
        companyId: companyId.toString(),
        timestamp: new Date().toISOString(),

        // OPERATIONS SUMMARY
        operations: {
          departmentName: "Operations",
          staffCount: headcountByDept.OPERATIONS || operationsStaffCount,
          recentStocks: stocksList,
          todayInward: {
            count: todayInwardAgg[0]?.count || 0,
            quantity: todayInwardAgg[0]?.totalQty || 0
          },
          tasks: {
            total: operationsTasks.length,
            pending: operationsTasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length,
            completed: operationsTasks.filter((t) => t.status === "COMPLETED").length
          }
        },

        // SALES SUMMARY
        sales: {
          departmentName: "Sales",
          staffCount: headcountByDept.SALES || salesStaffCount,
          todaySalesRevenue: todaySalesAgg[0]?.total || 0,
          monthSalesRevenue: monthSalesAgg[0]?.total || 0,
          recentTransactions: salesTransactions,
          pipeline: {
            totalDeals: crmDeals.length,
            pipelineValue: totalPipelineValue,
            wonValue: wonPipelineValue,
            leadsCount: crmDeals.filter((d) => d.stage === "LEAD").length
          },
          tasks: {
            total: salesTasks.length,
            pending: salesTasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length,
            completed: salesTasks.filter((t) => t.status === "COMPLETED").length
          }
        },

        // FINANCE SUMMARY
        finance: {
          departmentName: "Finance",
          staffCount: headcountByDept.FINANCE || financeStaffCount,
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          pendingOwnerApprovals,
          pendingCaReviews,
          tasks: {
            total: financeTasks.length,
            pending: financeTasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length,
            completed: financeTasks.filter((t) => t.status === "COMPLETED").length
          }
        },

        // HR SUMMARY
        hr: {
          departmentName: "Human Resources",
          totalEmployees,
          headcountByDepartment: headcountByDept,
          todayAttendance: {
            presentCount: todayAttendancePunches || 0
          },
          pendingLeaves
        }
      }
    });
  } catch (err) {
    console.error("GET /api/owner/department-summary Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch department summary." },
      { status: 500 }
    );
  }
}
