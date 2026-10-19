import fs from 'fs';

const filePath = 'D:/admin-erp/src/routes/audit.routes.js';
const content = `import express from 'express';
import {
  handleGetAuditLogs,
  handleCreateAuditLog,
  handleGetInvitations,
  handleCreateInvitation,
  handleRevokeInvitation,
  handleResendInvitation,
  handleAcceptInvitation,
} from '../controllers/auditLog.controller.js';
import { protect, optionalProtect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/audit-logs', optionalProtect, handleGetAuditLogs);
router.post('/audit-logs', optionalProtect, handleCreateAuditLog);

router.get('/invitations', optionalProtect, handleGetInvitations);
router.post('/invitations', optionalProtect, handleCreateInvitation);
router.post('/invitations/revoke/:id', optionalProtect, handleRevokeInvitation);
router.post('/invitations/resend/:id', optionalProtect, handleResendInvitation);
router.post('/invitations/accept', handleAcceptInvitation);

export default router;
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Updated D:/admin-erp/src/routes/audit.routes.js');
