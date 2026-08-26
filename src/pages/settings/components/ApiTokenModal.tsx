import { useState } from 'react';
import { Dialog } from '@/components/ui/composed/Dialog';
import { Button } from '@/components/ui/primitives/Button';
import { Input } from '@/components/ui/primitives/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addApiToken, removeApiToken, selectSettings, type ApiToken } from '@/store/slices/settingsSlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { showConfirm } from '@/components/ui/composed/ConfirmDialog.utils';
import { Key, Copy, Trash2, Plus, Check, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface ApiTokenModalProps {
    visible: boolean;
    onHide: () => void;
}

export function ApiTokenModal({ visible, onHide }: ApiTokenModalProps) {
    const dispatch = useAppDispatch();
    const { apiTokens } = useAppSelector(selectSettings);

    const [tokenName, setTokenName] = useState('');
    const [newTokenRaw, setNewTokenRaw] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showCreatedToken, setShowCreatedToken] = useState(true);

    const handleCreateToken = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tokenName.trim()) {
            showToast({ severity: 'warn', summary: 'Input Required', detail: 'Please provide a name for the API token.' });
            return;
        }

        // Generate a secure random token format: aeth_live_...
        const rawSecret = 'aeth_live_' + Array.from(crypto.getRandomValues(new Uint8Array(20)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

        const tokenObj: ApiToken = {
            id: 'tok_' + Date.now(),
            name: tokenName.trim(),
            keyPreview: rawSecret.slice(-8),
            createdAt: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
        };

        dispatch(addApiToken(tokenObj));
        setNewTokenRaw(rawSecret);
        setShowCreatedToken(true);
        setTokenName('');
        showToast({ severity: 'success', summary: 'Token Generated', detail: `API Token "${tokenObj.name}" created successfully.` });
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        showToast({ severity: 'info', summary: 'Copied', detail: 'Secret API token copied to clipboard.' });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRevoke = (id: string, name: string) => {
        showConfirm({
            header: 'Revoke API Token',
            message: `Are you sure you want to revoke "${name}"? Any external services using this token will instantly lose access.`,
            accept: () => {
                dispatch(removeApiToken(id));
                showToast({ severity: 'error', summary: 'Token Revoked', detail: `API Token "${name}" has been permanently revoked.` });
            },
        });
    };

    return (
        <Dialog
            visible={visible}
            onHide={() => {
                setNewTokenRaw(null);
                onHide();
            }}
            header={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Key size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                            Integration API Access Tokens
                        </h2>
                        <p className="text-xs font-medium text-muted-foreground italic">
                            Manage personal access tokens for external automated integrations and webhooks.
                        </p>
                    </div>
                </div>
            }
            className="max-w-2xl w-full"
        >
            <div className="flex flex-col gap-6 p-6">
                {/* Secret generated banner */}
                {newTokenRaw && (
                    <div className="p-5 rounded-2xl bg-success/10 border border-success/30 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-success font-bold text-sm">
                                <ShieldCheck size={18} />
                                <span>Save Your New API Token</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreatedToken(!showCreatedToken)}
                                className="text-xs text-success/80 hover:text-success flex items-center gap-1 font-bold"
                            >
                                {showCreatedToken ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showCreatedToken ? 'Hide Secret' : 'Show Secret'}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Make sure to copy your personal access token now. You won't be able to see it again!
                        </p>
                        <div className="flex items-center gap-2 bg-surface-elevated p-2.5 rounded-xl border border-success/20 font-mono text-xs text-foreground">
                            <span className="flex-1 truncate font-bold">
                                {showCreatedToken ? newTokenRaw : '•'.repeat(40)}
                            </span>
                            <Button
                                size="small"
                                variant="primary"
                                onClick={() => handleCopy(newTokenRaw)}
                                className="shrink-0 font-bold"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied' : 'Copy Token'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Form to generate new token */}
                <form onSubmit={handleCreateToken} className="flex flex-col sm:flex-row gap-3 items-end bg-surface-subtle p-4 rounded-xl border border-border-subtle">
                    <div className="flex-1 w-full">
                        <label htmlFor="token-name" className="block text-xs font-black uppercase text-foreground mb-1.5">
                            New Token Description / Name
                        </label>
                        <Input
                            id="token-name"
                            placeholder="e.g., Zapier Webhook, CI/CD Deployment Bot"
                            value={tokenName}
                            onChange={(e) => setTokenName(e.target.value)}
                            className="bg-surface-elevated"
                        />
                    </div>
                    <Button
                        variant="primary"
                        type="submit"
                        className="w-full sm:w-auto h-12 px-6 rounded-lg font-bold shrink-0"
                    >
                        <Plus size={16} />
                        Generate Token
                    </Button>
                </form>

                {/* Existing Tokens Table / List */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Active Tokens ({apiTokens.length})
                    </h4>

                    {apiTokens.length === 0 ? (
                        <div className="p-8 text-center bg-surface-subtle rounded-xl border border-dashed border-border-strong flex flex-col items-center gap-2">
                            <Key size={32} className="text-muted-foreground/40" />
                            <span className="text-sm font-bold text-foreground">No API Tokens Created</span>
                            <p className="text-xs text-muted-foreground">
                                Generate an API key above to allow external integrations to connect securely.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                            {apiTokens.map((token) => (
                                <div
                                    key={token.id}
                                    className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border-subtle hover:border-border-strong transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-surface-subtle flex items-center justify-center text-primary shrink-0">
                                            <Key size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground">{token.name}</span>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-0.5">
                                                <span>••••••••{token.keyPreview}</span>
                                                <span>•</span>
                                                <span className="font-sans">Created {token.createdAt}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        onClick={() => handleRevoke(token.id, token.name)}
                                        className="text-error hover:bg-error/10 hover:text-error h-9 px-3 rounded-lg text-xs font-bold"
                                        aria-label={`Revoke token ${token.name}`}
                                    >
                                        <Trash2 size={16} />
                                        Revoke
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
