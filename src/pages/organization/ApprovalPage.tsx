import { usePendingUsers } from '../settings/hooks/usePendingUsers';
import type { User } from '@/types/auth';
import type { UserRole } from '@/config/navItems';
import { useState } from 'react';
import { motion } from 'framer-motion';

function ApprovalPage() {
    const userroles: UserRole[] = [
        "SuperAdmin",
        "Admin",
        "HrAdmin",
        "FinanceAdmin",
        "Employee",
    ];
    
    const {pendingUsers,handleApproveUser,handleRejectUser} = usePendingUsers();
    const [selectedRoles, setSelectedRoles] = useState<Record<number, UserRole>>({});
          const handleRoleChange = (
          userId: number,
          role: UserRole
      ) => {
          setSelectedRoles((prev) => ({
              ...prev,
              [userId]: role,
          }));
      };
    return (
     <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-2xl border border-border-subtle shadow-soft overflow-hidden"
    >

    <div className="p-6 border-b border-border-subtle">
        <h2 className="text-lg font-black text-foreground">
            Pending Users
        </h2>

        <p className="text-xs text-muted-foreground">
            Approve or reject new user registrations.
        </p>
    </div>


    <div className="p-6 flex flex-col gap-4">
        {pendingUsers.length === 0 ? (
            <div className="text-center text-sm text-muted py-6">
                No pending users found
            </div>
        ) : (

            pendingUsers.map((user:User) => (

                <div
                    key={user.id}
                    className="
                    flex items-center justify-between
                    p-4 rounded-xl
                    border border-border-subtle
                    hover:bg-surface-subtle/50
                    transition-all
                    "
                >

                    <div className="flex items-center gap-4">

                        <img
                            src={user.image_url || "/avatar.png"}
                            className="
                            w-12 h-12 
                            rounded-full 
                            object-cover
                            border
                            "
                        />

                        <div>
                            <h3 className="font-bold text-foreground">
                                {user.username}
                            </h3>

                            <p className="text-xs text-muted">
                                {user.email}
                            </p>

                            <p className="text-xs text-muted">
                                {user.department} • {user.role}
                            </p>
                        </div>

                    </div>
       <select
        value={selectedRoles[user.id] ?? ""}
        onChange={(e) =>
        handleRoleChange(
            user.id,
            e.target.value as UserRole
        )
    }
    className="text-xs border rounded-lg px-3 py-2"
   >
    <option value="">
        Select Role
    </option>

    {userroles.map((role) => (
        <option key={role} value={role}>
            {role}
        </option>
    ))}
    </select>           
                    
        <div className="flex gap-3">
            <button
            onClick={() => {
           const role = selectedRoles[user.id];

           if (!role) {
             alert("Please select a role before approving");
             return;
           }
           handleApproveUser(user.id, role);
        }}

                            className="
                            px-4 py-2
                            rounded-lg
                            text-xs
                            font-bold
                            bg-green-500/10
                            text-green-600
                            border border-green-500/20
                            hover:bg-green-500
                            hover:text-white
                            transition-all
                            "
                        >
                            Approve
                        </button>


                        <button
                           onClick={() => handleRejectUser(user.id)}
                            className="
                            px-4 py-2
                            rounded-lg
                            text-xs
                            font-bold
                            bg-red-500/10
                            text-red-600
                            border border-red-500/20
                            hover:bg-red-500
                            hover:text-white
                            transition-all
                            "
                        >
                            Reject
                        </button>

                    </div>

                </div>

            ))

        )}

        </div>

       </motion.div>
  )
}

export default ApprovalPage