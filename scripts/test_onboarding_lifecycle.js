import pool from 'file:///D:/admin-erp/src/config/db.js';
import {
  sendInvitation,
  login,
  changeTemporaryPassword,
  completeOnboarding,
  getOnboardingStatus,
} from 'file:///D:/admin-erp/src/services/auth.service.js';
import { registerUser } from 'file:///D:/admin-erp/src/controllers/auth.controller.js';

async function runTests() {
  console.log('=== STARTING ONBOARDING LIFECYCLE TESTS ===\n');
  const testEmail = `test.onboarding.${Date.now()}@example.com`;
  let tempPass = '';
  let userId = null;

  try {
    // TEST 1: Public Registration Disabled
    console.log('TEST 1: Verifying public self-registration is disabled...');
    let regBlocked = false;
    const mockRes = {
      status(code) {
        if (code === 403) regBlocked = true;
        return {
          json(data) {
            return { code, data };
          },
        };
      },
    };
    await registerUser({ body: { email: 'bad@test.com' } }, mockRes);
    if (!regBlocked) throw new Error('Public self-registration is NOT disabled!');
    console.log('✓ PASS: Public self-registration returns 403 Forbidden.\n');

    // TEST 2: Send Invitation with Temporary Credentials
    console.log(`TEST 2: Sending invitation to ${testEmail}...`);
    const inviteRes = await sendInvitation(testEmail, 'Employee', 'Engineering');
    if (!inviteRes.success || !inviteRes.tempPass) {
      throw new Error('Failed to generate invitation with temporary password');
    }
    tempPass = inviteRes.tempPass;
    console.log(`✓ PASS: Invitation generated with temporary password: ${tempPass}`);

    // Verify DB state
    const [userRows] = await pool.execute('SELECT * FROM users WHERE email = ?', [testEmail]);
    if (userRows.length === 0) throw new Error('Invited user not found in DB');
    const dbUser = userRows[0];
    userId = dbUser.id;
    if (
      dbUser.is_temporary_password !== 1 ||
      dbUser.is_onboarded !== 0 ||
      dbUser.onboarding_step !== 1
    ) {
      throw new Error(
        `Invalid DB flags: is_temp=${dbUser.is_temporary_password}, is_onboarded=${dbUser.is_onboarded}, step=${dbUser.onboarding_step}`
      );
    }
    console.log(
      '✓ PASS: DB flags verified: is_temporary_password=1, is_onboarded=0, onboarding_step=1\n'
    );

    // TEST 3: Login with Temporary Password
    console.log('TEST 3: Logging in with temporary password...');
    const loginRes = await login(testEmail, tempPass);
    if (!loginRes.user.is_temporary_password || loginRes.user.is_onboarded) {
      throw new Error('Login response did not enforce temporary password / onboarding requirement');
    }
    console.log('✓ PASS: Login successful with temporary password flag detected.\n');

    // TEST 4: Step 1 - Change Temporary Password
    console.log('TEST 4: Step 1 - Changing temporary password to a secure personal password...');
    const newPersonalPass = 'Secret#2026Pass!';
    const changePassRes = await changeTemporaryPassword(userId, tempPass, newPersonalPass);
    if (!changePassRes.success || changePassRes.user.is_temporary_password) {
      throw new Error('Temporary password change failed');
    }
    console.log('✓ PASS: Temporary password successfully changed.\n');

    // TEST 5: Verify Temporary Password Invalidation (Single-Use)
    console.log('TEST 5: Verifying temporary password cannot be reused...');
    let tempReused = false;
    try {
      await login(testEmail, tempPass);
      tempReused = true;
    } catch (err) {
      // Expected to fail
    }
    if (tempReused)
      throw new Error('SECURITY VIOLATION: Temporary password was reused after change!');
    console.log('✓ PASS: Temporary password is single-use and invalid immediately.\n');

    // TEST 6: Resuming Incomplete Onboarding After Interruption / Logout
    console.log('TEST 6: Simulating session logout and re-login before completing Step 2...');
    const reloginRes = await login(testEmail, newPersonalPass);
    if (reloginRes.user.is_temporary_password) {
      throw new Error('User was incorrectly asked to change password again!');
    }
    if (reloginRes.user.is_onboarded || reloginRes.user.onboarding_step !== 2) {
      throw new Error(`Expected onboarding_step=2, got ${reloginRes.user.onboarding_step}`);
    }
    console.log(
      '✓ PASS: Incomplete onboarding resumed seamlessly at Step 2 without re-prompting password change.\n'
    );

    // TEST 7: Step 2 - Complete User Details
    console.log('TEST 7: Step 2 - Submitting required user profile details...');
    const profileDetails = {
      username: 'Test Onboarded User',
      contact_number: '+1-555-0199',
      department: 'Engineering',
      designation: 'Senior Developer',
    };
    const completeRes = await completeOnboarding(userId, profileDetails);
    if (
      !completeRes.success ||
      !completeRes.user.is_onboarded ||
      completeRes.user.onboarding_step !== 3
    ) {
      throw new Error('Complete onboarding failed');
    }
    console.log('✓ PASS: User details submitted and persisted successfully.\n');

    // TEST 8: Verify Complete Onboarding State
    console.log('TEST 8: Verifying complete onboarding status & normal access...');
    const finalStatus = await getOnboardingStatus(userId);
    if (
      finalStatus.is_temporary_password ||
      !finalStatus.is_onboarded ||
      finalStatus.onboarding_step !== 3
    ) {
      throw new Error('Final onboarding state invalid in database');
    }
    const finalLogin = await login(testEmail, newPersonalPass);
    if (!finalLogin.user.is_onboarded || finalLogin.user.is_temporary_password) {
      throw new Error('Final login does not reflect fully onboarded status');
    }
    console.log('✓ PASS: Onboarding marked complete. User has normal application access.\n');

    console.log('====================================================');
    console.log('🎉 ALL 8 BACKEND ONBOARDING LIFECYCLE TESTS PASSED!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  } finally {
    // Cleanup test user
    if (userId) {
      await pool.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]).catch(() => {});
      await pool.execute('DELETE FROM users WHERE id = ?', [userId]).catch(() => {});
      console.log('✓ Test user cleaned up.');
    }
    process.exit(0);
  }
}

runTests();
