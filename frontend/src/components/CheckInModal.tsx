import { useState, useEffect } from 'react';

interface CheckInModalProps {
    isOpen: boolean;
    habit: {
        id: string;
        name: string;
    } | null;
    currentStreak: number;
    onClose: () => void;
    onCheckIn: (habitId: string, notes?: string) => Promise<void>;
}

const MILESTONES = [7, 30, 100];

export default function CheckInModal({
    isOpen,
    habit,
    currentStreak,
    onClose,
    onCheckIn
}: CheckInModalProps) {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [milestone, setMilestone] = useState<number | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setNotes('');
            setSuccess(false);
            setShowConfetti(false);
            setMilestone(null);
        }
    }, [isOpen]);

    if (!isOpen || !habit) return null;

    async function handleCheckIn() {
        if (!habit) return;  // TypeScript null guard
        setLoading(true);

        try {
            await onCheckIn(habit.id, notes.trim() || undefined);
            setSuccess(true);

            // Check for milestone
            const newStreak = currentStreak + 1;
            if (MILESTONES.includes(newStreak)) {
                setMilestone(newStreak);
                setShowConfetti(true);
            }

            // Auto-close after delay
            setTimeout(() => {
                onClose();
            }, showConfetti ? 3000 : 1500);
        } catch (err) {
            console.error('Check-in failed:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {success ? (
                    <div className="text-center py-6">
                        {showConfetti && (
                            <div className="confetti-container">
                                {[...Array(50)].map((_, i) => (
                                    <div
                                        key={`confetti-${i}`}
                                        className="confetti-piece"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            animationDelay: `${Math.random() * 0.5}s`,
                                            backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6'][Math.floor(Math.random() * 5)],
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="text-6xl mb-4 animate-bounce">🎉</div>

                        {milestone ? (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    🏆 {milestone} Day Streak!
                                </h2>
                                <p className="text-gray-600">
                                    Amazing! You've completed {habit.name} for {milestone} days in a row!
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Great job!
                                </h2>
                                <p className="text-gray-600">
                                    You completed {habit.name} today!
                                </p>
                                <div className="mt-4 streak-badge inline-flex">
                                    <span className="text-2xl">🔥</span>
                                    <span className="streak-count">{currentStreak + 1}</span>
                                    <span className="streak-label">day streak</span>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Check In</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">✓</div>
                            <p className="text-lg font-medium text-gray-900">{habit.name}</p>
                            <p className="text-sm text-gray-500">Current streak: {currentStreak} days</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Add a note (optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="How did it go? Any reflections?"
                                className="input-field resize-none"
                                rows={3}
                            />
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
                                onClick={handleCheckIn}
                                className="btn-primary flex-1"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Complete ✓'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
