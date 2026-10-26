import React, { useState } from 'react';
import { X, Clock, Play } from 'lucide-react';

interface CustomTimerModalProps {
  currentMinutes: number;
  isOpen: boolean;
  onClose: () => void;
  onApply: (minutes: number) => void;
}

export const CustomTimerModal: React.FC<CustomTimerModalProps> = ({
  currentMinutes,
  isOpen,
  onClose,
  onApply,
}) => {
  const [hours, setHours] = useState(Math.floor(currentMinutes / 60));
  const [minutes, setMinutes] = useState(currentMinutes % 60);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalMin = Number(hours) * 60 + Number(minutes);
    if (isNaN(totalMin) || totalMin <= 0) {
      setError('Please enter a duration greater than 0 minutes.');
      return;
    }
    if (totalMin > 720) {
      setError('Maximum session duration is 12 hours (720 minutes).');
      return;
    }
    setError('');
    onApply(totalMin);
    onClose();
  };

  const handleQuickPick = (min: number) => {
    setHours(Math.floor(min / 60));
    setMinutes(min % 60);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-ivory rounded-3xl p-6 shadow-2xl border-2 border-espresso text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-espresso/60 hover:text-espresso rounded-full hover:bg-espresso/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-cherry-light text-cherry flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-espresso">Set Custom Duration</h3>
        <p className="text-xs text-espresso/70 mt-1">
          Choose any study time length for your focused session.
        </p>

        <div className="flex flex-wrap gap-2 justify-center my-4">
          {[25, 45, 60, 90, 120].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleQuickPick(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${hours * 60 + minutes === m
                  ? 'bg-espresso text-ivory border-espresso shadow-pixel-sm'
                  : 'bg-white text-espresso/80 border-espresso/15 hover:border-espresso/40'
                }`}
            >
              {m >= 60 ? `${m / 60}h` : `${m}m`}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-espresso/15 text-left">
              <label className="text-[11px] font-semibold uppercase text-espresso/50 block mb-1">
                Hours
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={hours}
                onChange={(e) => {
                  setHours(Math.max(0, parseInt(e.target.value) || 0));
                  setError('');
                }}
                className="w-full text-2xl font-bold font-pixel text-espresso bg-transparent focus:outline-none"
              />
            </div>

            <div className="bg-white p-3 rounded-2xl border border-espresso/15 text-left">
              <label className="text-[11px] font-semibold uppercase text-espresso/50 block mb-1">
                Minutes
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => {
                  setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)));
                  setError('');
                }}
                className="w-full text-2xl font-bold font-pixel text-espresso bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-xs text-cherry font-medium">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-espresso text-ivory font-semibold text-sm shadow-pixel-sm hover:translate-y-[-1px] transition pixel-press"
            >
              <Play className="w-4 h-4 text-cherry" />
              Apply Duration ({hours * 60 + minutes} min)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
