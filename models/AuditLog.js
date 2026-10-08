import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  entityId: { type: String, required: true }, // ID of the transaction or company
  entityName: { type: String, required: true }, // e.g., 'Transaction', 'Bulk Export'
  action: { type: String, required: true }, // e.g., 'CA_AUDIT_APPROVED', 'VAULT_UNLOCKED'
  performedBy: { type: String, required: true }, // User ID who took the action
  changes: { type: Object } // Store what changed (e.g., { statusChangedTo: 'APPROVED' })
}, { timestamps: true });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);