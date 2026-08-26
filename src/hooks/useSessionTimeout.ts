import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectSettings } from '@/store/slices/settingsSlice';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/components/ui/composed/Toast.utils';

// Timeout duration: 30 minutes in milliseconds
const TIMEOUT_MS = 30 * 60 * 1000;

export function useSessionTimeout() {
    const { sessionTimeoutEnabled } = useAppSelector(selectSettings);
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // If feature disabled or user not logged in, clear any active timer
        if (!sessionTimeoutEnabled || !user) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        const handleTimeout = async () => {
            localStorage.removeItem('aether_last_activity');
            showToast({
                severity: 'warn',
                summary: 'Session Expired',
                detail: 'You have been signed out due to 30 minutes of inactivity.',
            });
            try {
                await logout();
            } catch {
                // Ignore API error on forced logout
            }
            navigate('/auth/login', { replace: true });
        };

        // Check if user was idle for > 30 minutes while tab was closed or asleep
        const storedLastActivity = localStorage.getItem('aether_last_activity');
        if (storedLastActivity) {
            const elapsed = Date.now() - parseInt(storedLastActivity, 10);
            if (elapsed >= TIMEOUT_MS) {
                handleTimeout();
                return;
            }
        }

        const updateActivityTimestamp = () => {
            localStorage.setItem('aether_last_activity', String(Date.now()));
        };

        const resetTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            updateActivityTimestamp();
            timerRef.current = setTimeout(handleTimeout, TIMEOUT_MS);
        };

        // Start initial timer & save timestamp
        resetTimer();

        // Event listeners to detect active user interactions
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        let lastReset = Date.now();
        const onActivity = () => {
            const now = Date.now();
            // Throttle timer reset & timestamp write to at most once every 5 seconds
            if (now - lastReset > 5000) {
                lastReset = now;
                resetTimer();
            }
        };

        events.forEach((event) => {
            window.addEventListener(event, onActivity, { passive: true });
        });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, onActivity);
            });
        };
    }, [sessionTimeoutEnabled, user, logout, navigate]);
}
