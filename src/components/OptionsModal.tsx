import { Button } from "@/components/Button";
import { X, Settings } from "lucide-react";
import { InstallPrompt } from "./InstallPrompt";

interface OptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OptionsModal({ isOpen, onClose }: OptionsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm glass-card rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl ring-1 ring-white/10 relative">
                <div className="p-6 flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Settings className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold">Opzioni</h3>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <InstallPrompt />
                        {/* Future options can go here */}
                    </div>

                    <div className="pt-2">
                        <p className="text-xs text-center text-muted-foreground">
                            Divisor Pecuniae v1.0.1
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
