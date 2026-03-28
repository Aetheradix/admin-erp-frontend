import { useState } from 'react';
import { Button } from '@/components/ui/primitives/Button';
import { Textarea } from '@/components/ui/primitives/Textarea';
import { MessageSquare, AlertCircle } from 'lucide-react';

interface ApprovalDialogProps {
  type: 'Approved' | 'Rejected';
  request: any;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ApprovalDialog = ({ type, request, onConfirm, onCancel, loading }: ApprovalDialogProps) => {
  const [comment, setComment] = useState('');
  const isApproved = type === 'Approved';

  return (
    <div className="flex flex-col gap-6">
      <div className={`p-4 rounded-2xl flex items-start gap-4 ${isApproved ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-100' : 'bg-red-100'}`}>
          <AlertCircle size={16} />
        </div>
        <div>
          <h4 className="font-black uppercase tracking-widest text-[10px] mb-1">Attention Required</h4>
          <p className="text-xs font-medium leading-relaxed">
            You are about to <span className="font-bold">{type.toLowerCase()}</span> the {request?.type.toLowerCase()} request from <span className="font-bold italic">{request?.username}</span>.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <MessageSquare size={12} /> Admin Feedback (Optional)
        </label>
        <Textarea 
          placeholder={`Add a note for ${request?.username} regarding this ${type.toLowerCase()}...`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="rounded-2xl! bg-surface-subtle/30! border-none! focus:ring-2! focus:ring-primary/20!"
        />
        <p className="text-[10px] text-muted font-bold italic">This comment will be included in the notification email sent to the employee.</p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-subtle">
        <Button 
          variant="ghost" 
          onClick={onCancel} 
          disabled={loading}
          className="px-6! rounded-2xl! font-bold text-muted!"
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={() => onConfirm(comment)}
          loading={loading}
          className={`px-8! h-12 rounded-2xl! font-black tracking-wide shadow-lg ${isApproved ? 'bg-green-600! hover:bg-green-700! shadow-green-500/20!' : 'bg-red-600! hover:bg-red-700! shadow-red-500/20!'}`}
        >
          Confirm {type}
        </Button>
      </div>
    </div>
  );
};
