import { AlertTriangle, X } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean | null;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
}: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-background border border-border rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold mb-2">{title}</h2>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}