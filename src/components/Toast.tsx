"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-md border border-border bg-card p-4 shadow-2xl animate-slide-up">
            {type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={onClose}
                className="ml-2 rounded-md p-1 hover:bg-accent transition-colors"
            >
                <X className="h-4 w-4 opacity-50" />
            </button>
        </div>
    );
}

// Hook-like pattern for easier usage in components
export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const showToast = (message: string, type: ToastType = "success") => {
        setToast({ message, type });
    };

    const ToastComponent = toast ? (
        <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
        />
    ) : null;

    return { showToast, ToastComponent };
}
