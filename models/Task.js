import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
      index: true
    },
    // Strictly relational department binding
    department: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      enum: ["OPERATIONS", "SALES", "FINANCE", "HR"],
      index: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      index: true
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED"],
      default: "PENDING",
      index: true
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
      index: true
    },
    category: {
      type: String,
      trim: true,
      default: "GENERAL"
    },
    dueDate: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

// Indexes for high-performance role-based queries
TaskSchema.index({ companyId: 1, department: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
