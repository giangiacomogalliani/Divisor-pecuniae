import { Button } from "@/components/Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default"
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm glass-card rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl ring-1 ring-white/10">
                <div className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-500'}`}>
                        <AlertTriangle className="h-8 w-8" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">{title}</h3>
                        <p className="text-muted-foreground text-sm">{message}</p>
                    </div>
                </div>

                <div className="p-6 pt-0 flex gap-3">
                    <Button variant="ghost" className="flex-1 rounded-xl" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        className="flex-1 rounded-xl shadow-lg"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
