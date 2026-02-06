import React, { useState } from 'react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    habitName: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({
    isOpen,
    habitName,
    onClose,
    onConfirm
}: DeleteConfirmModalProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleConfirm() {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Habit?</h2>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete <strong>"{habitName}"</strong>?
                        This will also delete all your streak history. This action cannot be undone.
                    </p>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
