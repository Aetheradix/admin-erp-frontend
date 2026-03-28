import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

interface AdminRequestDialogProps {
    isApprove: boolean;
    comment: string;
    onCommentChange: (value: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
}

export const AdminRequestDialog = ({ 
    isApprove, 
    comment, 
    onCommentChange, 
    onCancel, 
    onSubmit 
}: AdminRequestDialogProps) => {
    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Admin Feedback (Optional)</label>
                <InputTextarea 
                    rows={4} 
                    value={comment} 
                    onChange={(e) => onCommentChange(e.target.value)} 
                    placeholder="Add a note for the user regarding this decision..."
                    className="w-full p-6 rounded-3xl border border-border-subtle focus:border-primary transition-colors text-sm font-medium"
                />
            </div>
            
            <div className="flex gap-4">
                <Button 
                    label="Cancel" 
                    onClick={onCancel} 
                    className="flex-1 py-4 rounded-2xl border-none bg-surface-subtle font-black text-[10px] uppercase tracking-widest text-muted hover:bg-surface-elevated transition-all"
                />
                <Button 
                    label={isApprove ? 'Confirm Approval' : 'Confirm Rejection'} 
                    onClick={onSubmit} 
                    className={`flex-1 py-4 rounded-2xl border-none font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all ${isApprove ? 'bg-success shadow-success/20' : 'bg-error shadow-error/20'}`}
                />
            </div>
        </div>
    );
};
