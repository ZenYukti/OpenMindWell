import { useState } from 'react';

interface CreateHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (habit: { name: string; description?: string; frequency: 'daily' | 'weekly' }) => Promise<void>;
}

export default function CreateHabitModal({ isOpen, onClose, onCreate }: CreateHabitModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!name.trim()) {
            setError('Please enter a habit name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onCreate({
                name: name.trim(),
                description: description.trim() || undefined,
                frequency,
            });

            // Reset form
            setName('');
            setDescription('');
            setFrequency('daily');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create habit');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Create New Habit</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Habit Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Morning Meditation"
                            className="input-field"
                            autoFocus
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., 10 minutes of mindfulness"
                            className="input-field resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequency
                        </label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                            className="input-field"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>

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
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Habit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
