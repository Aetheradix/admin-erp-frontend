interface StoredAuthUser {
  id?: string | number;
  email?: string;
  [key: string]: unknown;
}

interface AssignedProfileValues {
  employeeId: string;
  role: string;
  department: string;
  designation: string;
}

/**
 * Mirrors officially assigned profile details into the stored auth session
 * when the assigned employee is the currently logged-in user.
 */
export function syncAssignedUserSession(
  profileEmail: string | undefined,
  targetUserId: string | number,
  values: AssignedProfileValues
): void {
  const savedUserRaw = localStorage.getItem('user');
  if (!savedUserRaw) return;
  try {
    const currentAuthUser = JSON.parse(savedUserRaw) as StoredAuthUser;
    if (
      (currentAuthUser.email &&
        profileEmail &&
        currentAuthUser.email.toLowerCase() === profileEmail.toLowerCase()) ||
      String(currentAuthUser.id) === String(targetUserId)
    ) {
      const updatedAuthUser = {
        ...currentAuthUser,
        employee_id: values.employeeId,
        employee_code: values.employeeId,
        employeeId: values.employeeId,
        role: values.role,
        department: values.department,
        designation: values.designation,
      };
      localStorage.setItem('user', JSON.stringify(updatedAuthUser));
      window.dispatchEvent(new CustomEvent('auth_user_updated', { detail: updatedAuthUser }));
      window.dispatchEvent(new CustomEvent('aether_user_updated', { detail: updatedAuthUser }));
    }
  } catch {
    // Ignore malformed session data
  }
}
