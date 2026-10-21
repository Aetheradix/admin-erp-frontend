import pool from 'file:///D:/admin-erp/src/config/db.js';

async function updateToHasmukh() {
  try {
    // 1. Update system_audit_logs where user was 'Sarah Chen' or 'Admin'
    await pool.execute(
      "UPDATE system_audit_logs SET user = 'Hasmukh', user_email = 'hasmukh.arx@gmail.com' WHERE user IN ('Sarah Chen', 'Admin') OR user_email IN ('sarah.chen@aetheradix.com', 'admin@aetheradix.com')"
    );

    // 2. Update user_invitations where invited_by was 'Sarah Chen' or 'Admin'
    await pool.execute(
      "UPDATE user_invitations SET invited_by_name = 'Hasmukh', invited_by_role = 'SuperAdmin', invited_by_email = 'hasmukh.arx@gmail.com' WHERE invited_by_name IN ('Sarah Chen', 'Admin') OR invited_by_email IN ('sarah.chen@aetheradix.com', 'admin@aetheradix.com')"
    );

    // 3. Update details and changes strings in system_audit_logs
    await pool.execute(
      "UPDATE system_audit_logs SET details = REPLACE(details, 'Sarah Chen', 'Hasmukh') WHERE details LIKE '%Sarah Chen%'"
    );
    await pool.execute(
      "UPDATE system_audit_logs SET details = REPLACE(details, 'sarah.chen@aetheradix.com', 'hasmukh.arx@gmail.com') WHERE details LIKE '%sarah.chen@aetheradix.com%'"
    );
    await pool.execute(
      "UPDATE system_audit_logs SET changes = REPLACE(changes, 'Sarah Chen', 'Hasmukh') WHERE changes LIKE '%Sarah Chen%'"
    );
    await pool.execute(
      "UPDATE system_audit_logs SET changes = REPLACE(changes, 'sarah.chen@aetheradix.com', 'hasmukh.arx@gmail.com') WHERE changes LIKE '%sarah.chen@aetheradix.com%'"
    );

    console.log('✓ Successfully updated all MySQL records: SuperAdmin is Hasmukh (hasmukh.arx@gmail.com)');
    process.exit(0);
  } catch (err) {
    console.error('Error updating records:', err);
    process.exit(1);
  }
}

updateToHasmukh();
