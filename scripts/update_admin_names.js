import pool from 'file:///D:/admin-erp/src/config/db.js';

async function update() {
  try {
    // 1. Update generic 'Admin' in system_audit_logs to 'Sarah Chen' (SuperAdmin)
    await pool.execute(
      "UPDATE system_audit_logs SET user = 'Sarah Chen', user_email = 'sarah.chen@aetheradix.com' WHERE user = 'Admin' OR user_email = 'admin@aetheradix.com'"
    );

    // 2. Also ensure user_invitations has 'Sarah Chen' as the inviting Admin
    await pool.execute(
      "UPDATE user_invitations SET invited_by_name = 'Sarah Chen', invited_by_role = 'SuperAdmin', invited_by_email = 'sarah.chen@aetheradix.com' WHERE invited_by_name = 'Admin' OR invited_by_email = 'admin@aetheradix.com'"
    );

    // 3. Ensure user_invitations has proper records for guile, lee, kendra
    const [existing] = await pool.execute('SELECT email FROM user_invitations');
    const existingEmails = existing.map((e) => e.email.toLowerCase());

    const toAdd = [
      {
        email: 'guile@yopmail.com',
        name: 'Guile User',
        role: 'Employee',
        dept: 'Engineering',
        status: 'accepted',
        adminName: 'Sarah Chen',
        adminRole: 'SuperAdmin',
        adminEmail: 'sarah.chen@aetheradix.com',
      },
      {
        email: 'lee@yopmail.com',
        name: 'Lee User',
        role: 'Employee',
        dept: 'Engineering',
        status: 'accepted',
        adminName: 'Sarah Chen',
        adminRole: 'SuperAdmin',
        adminEmail: 'sarah.chen@aetheradix.com',
      },
      {
        email: 'kendra@yopmail.com',
        name: 'Kendra User',
        role: 'Employee',
        dept: 'Engineering',
        status: 'pending',
        adminName: 'Sarah Chen',
        adminRole: 'SuperAdmin',
        adminEmail: 'sarah.chen@aetheradix.com',
      },
    ];

    for (const item of toAdd) {
      if (!existingEmails.includes(item.email.toLowerCase())) {
        const id = 'inv-' + item.email.split('@')[0];
        await pool.execute(
          `INSERT INTO user_invitations (id, email, name, role, department, invited_by_name, invited_by_email, invited_by_role, expires_at, status, token, temp_password, accepted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?, ?, 'Aether@Temp2026!', NOW())`,
          [
            id,
            item.email,
            item.name,
            item.role,
            item.dept,
            item.adminName,
            item.adminEmail,
            item.adminRole,
            item.status,
            'tok_' + id,
          ]
        );
        console.log('Added invitation for', item.email);
      }
    }

    // 4. Also add corresponding "User Invitation Dispatched" log entries for guile and lee if missing
    const [logs] = await pool.execute('SELECT action, target_email FROM system_audit_logs');
    const inviteDispatchedEmails = logs
      .filter((l) => l.action === 'User Invitation Dispatched')
      .map((l) => (l.target_email || '').toLowerCase());

    for (const item of toAdd) {
      if (!inviteDispatchedEmails.includes(item.email.toLowerCase())) {
        const logId = 'log-' + item.email.split('@')[0] + '-1';
        await pool.execute(
          `INSERT INTO system_audit_logs (id, action, category, user, user_email, target, target_email, timestamp, ip, status, details, changes)
           VALUES (?, 'User Invitation Dispatched', 'invitation', ?, ?, ?, ?, NOW(), '192.168.1.45', 'Success', ?, ?)`,
          [
            logId,
            item.adminName,
            item.adminEmail,
            `${item.name} (${item.email})`,
            item.email,
            `Admin ${item.adminName} (${item.adminRole}) dispatched user onboarding invitation to ${item.name} (${item.email}) for role ${item.role} in ${item.dept}.`,
            JSON.stringify([
              {
                field: 'Invited By Admin',
                from: null,
                to: `${item.adminName} (${item.adminRole} · ${item.adminEmail})`,
              },
              { field: 'Invitee Name', from: null, to: item.name },
              { field: 'Invitee Email', from: null, to: item.email },
              { field: 'Assigned Role', from: null, to: item.role },
            ]),
          ]
        );
        console.log('Added Dispatched audit log for', item.email);
      }
    }

    console.log(
      '✓ Successfully updated all MySQL audit logs and invitation records with Admin Name'
    );
    process.exit(0);
  } catch (err) {
    console.error('Error updating records:', err);
    process.exit(1);
  }
}

update();
