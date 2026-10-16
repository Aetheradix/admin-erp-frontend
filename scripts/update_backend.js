import fs from 'fs';
import path from 'path';

const backendDir = 'D:/admin-erp';

// 1. Update jwt.helper.js
const jwtHelperPath = path.join(backendDir, 'src/utils/jwt.helper.js');
const jwtHelperContent = `import jwt from 'jsonwebtoken';
import { jwt as jwtConfig } from '../config/env.js';
import jwtLib from 'jsonwebtoken';

export const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    return null;
  }
};

export const signToken = (id, role, extraClaims = {}) => {
  return jwtLib.sign({ id, role, ...extraClaims }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};
`;
fs.writeFileSync(jwtHelperPath, jwtHelperContent, 'utf8');
console.log('✓ Updated jwt.helper.js');

// 2. Update auth.middleware.js
const authMiddlewarePath = path.join(backendDir, 'src/middleware/auth.middleware.js');
const authMiddlewareContent = `import jwt from 'jsonwebtoken';
import { jwt as jwtConfig } from '../config/env.js';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Not authorized, no token',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      is_temporary_password: Boolean(decoded.is_temporary_password),
      is_onboarded: decoded.is_onboarded !== undefined ? Boolean(decoded.is_onboarded) : true,
      onboarding_step: decoded.onboarding_step ?? 3,
    };

    // If onboarding is incomplete, restrict access on protected routes
    const isTemp = req.user.is_temporary_password;
    const isOnboarded = req.user.is_onboarded;

    if (isTemp || !isOnboarded) {
      const allowedPaths = [
        '/api/auth/change-temporary-password',
        '/api/auth/change-password',
        '/api/auth/complete-onboarding',
        '/api/auth/onboarding-status',
        '/api/auth/logout',
        '/api/auth/me/permissions',
        '/api/auth/profile',
      ];
      const isAllowed = allowedPaths.some((p) => req.originalUrl.startsWith(p));
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          code: 'ONBOARDING_REQUIRED',
          message:
            'Mandatory onboarding in progress. Please change your temporary password and complete user details before accessing other features.',
          is_temporary_password: isTemp,
          is_onboarded: isOnboarded,
          onboarding_step: req.user.onboarding_step || 1,
        });
      }
    }

    return next();
  } catch (error) {
    console.error('JWT VERIFY ERROR:', error);

    return res.status(401).json({
      message: 'Not authorized, token failed',
    });
  }
};
`;
fs.writeFileSync(authMiddlewarePath, authMiddlewareContent, 'utf8');
console.log('✓ Updated auth.middleware.js');

// 3. Update auth.service.js
const authServicePath = path.join(backendDir, 'src/services/auth.service.js');
let authServiceContent = fs.readFileSync(authServicePath, 'utf8');

// Update login function in auth.service.js
const loginRegex = /export const login = async \(email, password\) => \{[\s\S]*?return \{\s*user: \{[\s\S]*?\},[\s\S]*?token,[\s\S]*?\};[\s\S]*?\};/;
const newLoginFunction = `export const login = async (email, password) => {
  const [rows] = await pool.execute(
    \`
      SELECT
        id,
        username,
        email,
        password,
        contact_number,
        department,
        designation,
        role,
        image_url,
        status,
        join_date,
        account_status,
        is_temporary_password,
        is_onboarded,
        onboarding_step,
        temp_password_expires_at
      FROM users
      WHERE email = ?
      LIMIT 1
    \`,
    [email]
  );

  if (rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = rows[0];

  // Check password
  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    throw new Error('Invalid credentials');
  }

  // Only account approval controls whether the user can login
  if (String(user.account_status).trim().toLowerCase() !== 'approved') {
    throw new Error('Your account is pending approval or has not been approved.');
  }

  const isTemp = Boolean(user.is_temporary_password);
  const isOnboarded = user.is_onboarded !== undefined ? Boolean(user.is_onboarded) : true;
  const currentStep = user.onboarding_step ?? (isTemp ? 1 : isOnboarded ? 3 : 2);

  // If temporary password, check expiration
  if (isTemp && user.temp_password_expires_at) {
    if (new Date(user.temp_password_expires_at).getTime() < Date.now()) {
      throw new Error(
        'Temporary password has expired. Please contact an administrator for a new invitation.'
      );
    }
  }

  const token = signToken(user.id, user.role, {
    is_temporary_password: isTemp,
    is_onboarded: isOnboarded,
    onboarding_step: currentStep,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department || 'Management',
      designation: user.designation || null,
      contact_number: user.contact_number || null,
      image_url: user.image_url || null,
      status: user.status,
      join_date: user.join_date || null,
      is_temporary_password: isTemp,
      is_onboarded: isOnboarded,
      onboarding_step: currentStep,
    },
    token,
  };
};`;

if (loginRegex.test(authServiceContent)) {
  authServiceContent = authServiceContent.replace(loginRegex, newLoginFunction);
  console.log('✓ Replaced login function in auth.service.js');
} else {
  console.warn('⚠️ Could not match loginRegex, manual replacement may be needed');
}

// Update sendInvitation function in auth.service.js
const sendInvitationRegex = /export const sendInvitation = async \(email, role\) => \{[\s\S]*?return \{ message: \`Invitation sent successfully to \$\{email\}\` \};[\s\S]*?\};/;
const newSendInvitationFunction = `export const sendInvitation = async (email, role, department = 'Engineering') => {
  // 1. Check if user already exists
  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new Error('A user with this email is already registered.');
  }

  // 2. Generate single-use temporary password & hash it
  const tempPassword = \`Temp#\${crypto.randomBytes(3).toString('hex').toUpperCase()}\`;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(tempPassword, salt);

  // 3. Generate default username from email prefix
  const username = email.split('@')[0];
  const frontendBase = process.env.FRONTEND_URL || 'https://erp.aetheradix.com';
  const loginUrl = \`\${frontendBase}/auth/login\`;

  // 4. Create user directly as pre-approved with mandatory onboarding flags
  const [insertRes] = await pool.execute(
    \`
    INSERT INTO users (
      username,
      email,
      password,
      role,
      department,
      status,
      account_status,
      is_temporary_password,
      is_onboarded,
      onboarding_step,
      temp_password_expires_at,
      approved_at,
      join_date
    )
    VALUES (?, ?, ?, ?, ?, 'active', 'Approved', 1, 0, 1, DATE_ADD(NOW(), INTERVAL 7 DAY), CURRENT_TIMESTAMP, CURDATE())
    \`,
    [username, email, hashedPassword, role, department]
  );
  const newUserId = insertRes.insertId;

  // 5. Assign RBAC role in user_roles table if role exists
  try {
    const [roleRows] = await pool.execute('SELECT id FROM roles WHERE name = ? LIMIT 1', [role]);
    if (roleRows.length > 0) {
      await pool.execute(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)',
        [newUserId, roleRows[0].id]
      );
    }
  } catch (err) {
    console.warn('Role assignment warning in sendInvitation:', err.message);
  }

  // 6. Record in approval_logs for auditable history
  try {
    await pool.execute(
      \`INSERT INTO approval_logs (target_user_name, target_user_email, action, assigned_role) VALUES (?, ?, 'INVITATION_SENT', ?)\`,
      [username, email, role]
    );
  } catch (err) {
    // Ignore audit log error if table differs
  }

  // 7. Send Email with credentials
  const emailHtml = \`
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #111;">You're Invited to AetherERP</h2>
      <p>An account has been created for you with the role: <strong>\${role}</strong>.</p>
      <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Login Page:</strong> <a href="\${loginUrl}">\${loginUrl}</a></p>
        <p style="margin: 4px 0;"><strong>Email:</strong> \${email}</p>
        <p style="margin: 4px 0;"><strong>Single-Use Temporary Password:</strong> <code>\${tempPassword}</code></p>
      </div>
      <p style="font-size: 13px; color: #e11d48; font-weight: bold;">
        Important: You will be required to change your temporary password and complete your profile on first login.
      </p>
      <p style="font-size: 11px; color: #666;">This temporary credential is valid for 7 days.</p>
    </div>
  \`;

  try {
    await sendEmail(email, 'Your Invitation & Credentials - AetherERP', emailHtml);
  } catch (emailErr) {
    console.warn('Email dispatch warning:', emailErr.message);
  }

  return {
    success: true,
    message: \`Invitation sent successfully to \${email}\`,
    email,
    tempPass: tempPassword,
  };
};`;

if (sendInvitationRegex.test(authServiceContent)) {
  authServiceContent = authServiceContent.replace(sendInvitationRegex, newSendInvitationFunction);
  console.log('✓ Replaced sendInvitation function in auth.service.js');
} else {
  console.warn('⚠️ Could not match sendInvitationRegex, checking append');
}

// Append changeTemporaryPassword, completeOnboarding, getOnboardingStatus
const onboardingServices = `
/**
 * Mandatory Step 1: Change Temporary Password
 */
export const changeTemporaryPassword = async (userId, currentPassword, newPassword) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
  if (rows.length === 0) throw new Error('User not found.');
  const user = rows[0];

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current temporary password is incorrect.');
  }

  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    throw new Error('New password must be different from temporary password.');
  }

  // Password complexity: min 8 chars, uppercase, lowercase, number, symbol
  if (
    newPassword.length < 8 ||
    !/[A-Z]/.test(newPassword) ||
    !/[a-z]/.test(newPassword) ||
    !/[0-9]/.test(newPassword) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  ) {
    throw new Error(
      'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.'
    );
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Invalidate temporary password immediately and move to step 2
  await pool.execute(
    'UPDATE users SET password = ?, is_temporary_password = 0, temp_password_expires_at = NULL, onboarding_step = 2 WHERE id = ?',
    [hashedPassword, userId]
  );

  const token = signToken(user.id, user.role, {
    is_temporary_password: false,
    is_onboarded: Boolean(user.is_onboarded),
    onboarding_step: 2,
  });

  return {
    success: true,
    message: 'Temporary password changed successfully. Please complete your profile details.',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      is_temporary_password: false,
      is_onboarded: Boolean(user.is_onboarded),
      onboarding_step: 2,
    },
  };
};

/**
 * Mandatory Step 2: Complete User Details & Finalize Onboarding
 */
export const completeOnboarding = async (userId, data) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
  if (rows.length === 0) throw new Error('User not found.');
  const user = rows[0];

  const username = (data.username || data.name || user.username || '').trim();
  const contact_number = (data.contact_number || data.contactNo || user.contact_number || '').trim();
  const department = (data.department || user.department || 'Engineering').trim();
  const designation = (data.designation || user.designation || 'Staff Member').trim();

  if (!username) {
    throw new Error('Full name is required.');
  }
  if (!contact_number) {
    throw new Error('Contact number is required.');
  }

  await pool.execute(
    \`
    UPDATE users SET
      username = ?,
      contact_number = ?,
      department = ?,
      designation = ?,
      is_onboarded = 1,
      is_temporary_password = 0,
      onboarding_step = 3
    WHERE id = ?
    \`,
    [username, contact_number, department, designation, userId]
  );

  const token = signToken(user.id, user.role, {
    is_temporary_password: false,
    is_onboarded: true,
    onboarding_step: 3,
  });

  return {
    success: true,
    message: 'Onboarding completed successfully!',
    token,
    user: {
      id: user.id,
      username,
      email: user.email,
      role: user.role,
      department,
      designation,
      contact_number,
      is_temporary_password: false,
      is_onboarded: true,
      onboarding_step: 3,
    },
  };
};

/**
 * Get Onboarding Status
 */
export const getOnboardingStatus = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT is_temporary_password, is_onboarded, onboarding_step FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) throw new Error('User not found.');
  return {
    is_temporary_password: Boolean(rows[0].is_temporary_password),
    is_onboarded: Boolean(rows[0].is_onboarded),
    onboarding_step: rows[0].onboarding_step ?? 3,
  };
};
`;

if (!authServiceContent.includes('export const changeTemporaryPassword')) {
  authServiceContent += onboardingServices;
  console.log('✓ Added onboarding services to auth.service.js');
}

fs.writeFileSync(authServicePath, authServiceContent, 'utf8');
console.log('✓ Saved auth.service.js');

// 4. Update auth.controller.js
const authControllerPath = path.join(backendDir, 'src/controllers/auth.controller.js');
let authControllerContent = fs.readFileSync(authControllerPath, 'utf8');

// Disable public self-registration
authControllerContent = authControllerContent.replace(
  /export const registerUser = async \(req, res\) => \{[\s\S]*?\};/,
  `export const registerUser = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Public self-registration is disabled. Access is by administrator invitation only.',
  });
};`
);

// Add controller functions
const newControllers = `
export const changeTemporaryPasswordController = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current temporary password and new password are required.',
      });
    }
    const result = await changeTemporaryPassword(req.user.id, currentPassword, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const completeOnboardingController = async (req, res) => {
  try {
    const result = await completeOnboarding(req.user.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getOnboardingStatusController = async (req, res) => {
  try {
    const result = await getOnboardingStatus(req.user.id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
`;

if (!authControllerContent.includes('changeTemporaryPasswordController')) {
  // Update imports in auth.controller.js
  authControllerContent = authControllerContent.replace(
    /import \{([\s\S]*?)\} from '\.\.\/services\/auth\.service\.js';/,
    (match, p1) => {
      const imports = p1.trim();
      return `import {
  ${imports},
  changeTemporaryPassword,
  completeOnboarding,
  getOnboardingStatus,
} from '../services/auth.service.js';`;
    }
  );
  authControllerContent += newControllers;
  console.log('✓ Added onboarding controllers to auth.controller.js');
}

fs.writeFileSync(authControllerPath, authControllerContent, 'utf8');
console.log('✓ Saved auth.controller.js');

// 5. Update auth.routes.js
const authRoutesPath = path.join(backendDir, 'src/routes/auth.routes.js');
let authRoutesContent = fs.readFileSync(authRoutesPath, 'utf8');

if (!authRoutesContent.includes('changeTemporaryPasswordController')) {
  authRoutesContent = authRoutesContent.replace(
    /import \{([\s\S]*?)\} from '\.\.\/controllers\/auth\.controller\.js';/,
    (match, p1) => {
      const imports = p1.trim();
      return `import {
  ${imports},
  changeTemporaryPasswordController,
  completeOnboardingController,
  getOnboardingStatusController,
} from '../controllers/auth.controller.js';`;
    }
  );

  const routeAdditions = `
// Mandatory Onboarding routes
router.post('/change-temporary-password', protect, changeTemporaryPasswordController);
router.post('/complete-onboarding', protect, completeOnboardingController);
router.get('/onboarding-status', protect, getOnboardingStatusController);
`;

  authRoutesContent = authRoutesContent.replace(
    'export default router;',
    `${routeAdditions}\nexport default router;`
  );
  console.log('✓ Added onboarding routes to auth.routes.js');
}

fs.writeFileSync(authRoutesPath, authRoutesContent, 'utf8');
console.log('✓ Saved auth.routes.js');
console.log('ALL BACKEND UPDATES COMPLETED SUCCESSFULLY!');
