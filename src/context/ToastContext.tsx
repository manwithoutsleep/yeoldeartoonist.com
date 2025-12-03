'use client';

/**
 * Toast Context
 *
 * Provides a global toast notification system for the application.
 * Toasts are used to show brief, auto-dismissing messages to the user.
 *
 * Features:
 * - Add toast notifications with customizable messages
 * - Auto-dismiss after configurable timeout (default 2000ms)
 * - Multiple toasts can be shown simultaneously
 * - Fixed position overlay that's always visible
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
    id: string;
    message: string;
    duration?: number;
}

export interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, duration = 2000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, message, duration };

        setToasts((prev) => [...prev, toast]);

        // Auto-remove after duration
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
