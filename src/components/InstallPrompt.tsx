"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Download } from "lucide-react";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handler);

        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    };

    if (isInstalled) return null;
    if (!deferredPrompt) return null;

    return (
        <Button
            variant="glass"
            className="w-full justify-start h-14 text-lg"
            onClick={handleInstallClick}
        >
            <Download className="mr-3 h-5 w-5" />
            Installa come app
        </Button>
    );
}
