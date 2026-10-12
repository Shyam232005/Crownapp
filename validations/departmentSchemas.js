import { z } from "zod";

export const DepartmentEnum = z.enum(["OPERATIONS", "SALES", "FINANCE", "HR", "GENERAL"]);
export const EmployeeRoleEnum = z.enum(["EMPLOYEE", "MANAGER", "HEAD", "ADMIN", "VIEWER"]);

export const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const taskStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED"]);

export const createTaskSchema = z.object({
  department: z.enum(["OPERATIONS", "SALES", "FINANCE", "HR"]),
  title: z.string().min(2, "Task title must be at least 2 characters."),
  description: z.string().optional(),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid assigned employee ID.").optional(),
  priority: taskPriorityEnum.default("MEDIUM"),
  category: z.string().optional(),
  dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const updateTaskStatusSchema = z.object({
  status: taskStatusEnum,
  completedAt: z.string().optional()
});

export const reportUploadSchema = z.object({
  department: z.enum(["FINANCE", "OPERATIONS", "SALES", "HR"]).default("FINANCE"),
  reportType: z.string().min(2, "Report type is required."),
  period: z.string().min(2, "Period (e.g. 'October 2026') is required."),
  fileData: z.string().min(10, "Base64 file data or link is required."),
  category: z.string().optional(),
  staffName: z.string().optional()
});

export const employeeDepartmentAssignmentSchema = z.object({
  employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid employee ID"),
  department: DepartmentEnum,
  role: EmployeeRoleEnum.default("EMPLOYEE")
});
