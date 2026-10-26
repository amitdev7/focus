import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { StudySession, Subject } from '../../types';
import { RetroCrtSmiley } from '../common/RetroCrtSmiley';
import { PixelCherry } from '../common/PixelCherry';
import { Coffee, ArrowRight, X, Sparkles } from 'lucide-react';
import { formatHoursMinutes } from '../../services/analytics';

interface CompletionModalProps {
  session: StudySession | null;
  subjects: Subject[];
  onClose: () => void;
  onStartBreak: (minutes: number) => void;
  onStartNextFocus: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  session,
  subjects,
  onClose,
  onStartBreak,
  onStartNextFocus,
}) => {
  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E53945', '#BDA9D5', '#92AA7B', '#E8C9DA', '#FFFEFC'],
      });
    } catch (e) {
      console.warn('Confetti launch error', e);
    }
  }, []);

  if (!session) return null;

  const subject = subjects.find((s) => s.id === session.subjectId);
  const isFocus = session.mode === 'pomodoro' || session.mode === 'custom';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-ivory rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-espresso text-center overflow-hidden">
        {/* Subtle grid background on modal */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-24 opacity-40 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-espresso/60 hover:text-espresso rounded-full hover:bg-espresso/5 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Icon */}
        <div className="relative z-10 flex items-center justify-center gap-3 mb-4">
          <RetroCrtSmiley size={72} glow animated />
          <PixelCherry size={48} showGrid />
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cherry-light text-cherry-dark text-xs font-semibold uppercase tracking-wider mb-2 font-pixel">
            <Sparkles className="w-3.5 h-3.5" />
            {isFocus ? 'Session Complete!' : 'Break Over!'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-espresso tracking-tight">
            {isFocus ? 'Glorious Focus!' : 'Feeling Refreshed?'}
          </h2>
          <p className="text-sm text-espresso/70 mt-1">
            {isFocus
              ? 'Every minute spent builds your compounding mastery.'
              : 'Your mind is recharged and ready for another deep streak.'}
          </p>
        </div>

        {/* Stats card */}
        <div className="relative z-10 my-6 p-4 rounded-2xl bg-white border border-espresso/10 shadow-sm flex items-center justify-around">
          <div>
            <div className="text-xs uppercase text-espresso/50 font-medium">Focused Time</div>
            <div className="text-2xl font-black text-espresso font-pixel mt-0.5">
              {formatHoursMinutes(session.actualDuration)}
            </div>
          </div>
          <div className="h-8 w-px bg-espresso/10" />
          <div>
            <div className="text-xs uppercase text-espresso/50 font-medium">Subject</div>
            <div className="flex items-center gap-1.5 mt-1 justify-center">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: subject?.color || '#92AA7B' }}
              />
              <span className="text-sm font-semibold text-espresso">
                {subject?.name || 'General'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 space-y-2.5">
          {isFocus ? (
            <>
              <button
                onClick={() => {
                  onStartBreak(5);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-espresso text-ivory font-semibold text-sm shadow-pixel-sm hover:translate-y-[-1px] active:translate-y-[1px] transition pixel-press"
              >
                <Coffee className="w-4 h-4 text-blossom" />
                Take a 5-min Short Break
              </button>

              <button
                onClick={() => {
                  onStartBreak(15);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white border border-espresso/20 text-espresso font-medium text-sm hover:bg-ivory transition"
              >
                Take a 15-min Long Break
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onStartNextFocus();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-cherry text-white font-semibold text-sm shadow-pixel-sm hover:bg-cherry-dark transition pixel-press"
            >
              Start Next Focus Session
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
