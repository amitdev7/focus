import React from 'react';
import { AlertCircle, Save, Trash2 } from 'lucide-react';
import { formatHoursMinutes } from '../../services/analytics';

interface ManualStopModalProps {
  elapsedSec: number;
  plannedSec: number;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export const ManualStopModal: React.FC<ManualStopModalProps> = ({
  elapsedSec,
  plannedSec,
  onSave,
  onDiscard,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-ivory rounded-3xl p-6 shadow-2xl border-2 border-espresso text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-300">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-espresso">Save Focused Progress?</h3>
        <p className="text-sm text-espresso/70 mt-2">
          You stopped your timer before reaching the planned duration.
        </p>

        <div className="my-5 p-4 rounded-2xl bg-white border border-espresso/10 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-espresso/60">Actual Focused Time:</span>
            <span className="font-bold text-espresso font-pixel">{formatHoursMinutes(elapsedSec)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-espresso/60">Planned Target:</span>
            <span className="text-espresso font-medium">{formatHoursMinutes(plannedSec)}</span>
          </div>
          <div className="w-full bg-espresso/5 rounded-full h-2 overflow-hidden mt-1">
            <div
              className="bg-cherry h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (elapsedSec / plannedSec) * 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onSave}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-espresso text-ivory font-semibold text-sm shadow-pixel-sm hover:translate-y-[-1px] transition pixel-press"
          >
            <Save className="w-4 h-4 text-sage" />
            Save {formatHoursMinutes(elapsedSec)} to Study Records
          </button>

          <button
            onClick={onDiscard}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-rose-200 text-rose-700 font-medium text-sm hover:bg-rose-50 transition"
          >
            <Trash2 className="w-4 h-4" />
            Discard Without Saving
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2 text-xs text-espresso/50 hover:text-espresso transition"
          >
            Resume / Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
