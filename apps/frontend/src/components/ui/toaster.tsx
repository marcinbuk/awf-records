import * as React from "react"
import { cn } from "@/lib/utils"

type ToastVariant = "default" | "destructive" | "success"

interface Toast {
    id: string
    title?: string
    description?: string
    variant?: ToastVariant
}

const toastListeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

function notifyListeners() {
    toastListeners.forEach(fn => fn([...toasts]))
}

export function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
    const id = Math.random().toString(36).slice(2)
    toasts = [...toasts, { id, title, description, variant }]
    notifyListeners()
    setTimeout(() => {
        toasts = toasts.filter(t => t.id !== id)
        notifyListeners()
    }, 4000)
}

export function useToast() {
    const [localToasts, setLocalToasts] = React.useState<Toast[]>(toasts)
    React.useEffect(() => {
        toastListeners.push(setLocalToasts)
        return () => {
            const idx = toastListeners.indexOf(setLocalToasts)
            if (idx > -1) toastListeners.splice(idx, 1)
        }
    }, [])
    return { toasts: localToasts, toast }
}

export function Toaster() {
    const { toasts } = useToast()
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={cn(
                        "rounded-lg border p-4 shadow-lg animate-fade-in",
                        t.variant === "destructive" ? "bg-destructive/90 text-destructive-foreground border-destructive" :
                            t.variant === "success" ? "bg-green-500/90 text-white border-green-500" :
                                "bg-card text-card-foreground border-border"
                    )}
                >
                    {t.title && <div className="font-semibold text-sm">{t.title}</div>}
                    {t.description && <div className="text-xs mt-0.5 opacity-80">{t.description}</div>}
                </div>
            ))}
        </div>
    )
}
