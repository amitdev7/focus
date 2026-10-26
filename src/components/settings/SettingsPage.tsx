import React, { useState, useRef } from 'react';
import type { UserSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { soundService } from '../../services/sound';
import { NotificationService } from '../../services/notification';
import {
  Bell,
  Volume2,
  Clock,
  Target,
  Palette,
  Download,
  Upload,
  CheckCircle2,
  Coffee,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetTimer: () => void;
  onDataImported: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetTimer,
  onDataImported,
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [resetTimerFeedback, setResetTimerFeedback] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = (newValues: Partial<UserSettings>) => {
    const updated = { ...formData, ...newValues };
    setFormData(updated);
    onUpdateSettings(updated);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleTimerChange = (key: keyof UserSettings['timer'], value: any) => {
    const updatedTimer = { ...formData.timer, [key]: value };
    handleSave({ timer: updatedTimer });
  };

  const handleTestSound = () => {
    soundService.playCompletionChime(formData.timer.soundVolume);
  };

  const handleToggleNotifications = async () => {
    const current = formData.timer.notificationsEnabled;
    if (!current) {
      const granted = await NotificationService.requestPermission();
      if (granted) {
        handleTimerChange('notificationsEnabled', true);
        NotificationService.show('FocusFlow Notifications Active', {
          body: "You'll be alerted when your focus sessions and breaks wrap up!",
        });
      } else {
        alert('Notification permission was blocked or denied in your browser settings.');
        handleTimerChange('notificationsEnabled', false);
      }
    } else {
      handleTimerChange('notificationsEnabled', false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await StorageService.importFromJson(file);
    setImportStatus(result);
    if (result.success) {
      onDataImported();
      if (result.data) {
        setFormData(result.data.userSettings);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTriggerResetTimer = () => {
    onResetTimer();
    setResetTimerFeedback(true);
    setTimeout(() => setResetTimerFeedback(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
            Settings &amp; Preferences
          </h2>
          <p className="text-sm text-espresso/60 mt-1">
            Personalize your study goals, timer presets, break durations, and aesthetic themes.
          </p>
        </div>

        {saveFeedback && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sage/20 text-sage-dark text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* QUICK TIMER CONTROLS: RESET TIMER OPTION */}
      <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-cherry" />
            <h3 className="font-bold text-lg text-espresso">Reset Active Timer</h3>
          </div>
          <p className="text-xs text-espresso/60 mt-1">
            Instantly restore the active countdown timer back to its initial starting duration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {resetTimerFeedback && (
            <span className="text-xs font-semibold text-emerald-600 animate-fade-in">
              Timer Reset!
            </span>
          )}
          <button
            onClick={handleTriggerResetTimer}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-espresso text-ivory text-xs font-semibold shadow-pixel-sm hover:translate-y-[-1px] transition pixel-press"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Timer</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PROFILE & STUDY GOALS */}
      <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-espresso/10">
          <Target className="w-5 h-5 text-cherry" />
          <h3 className="font-bold text-lg text-espresso">Profile &amp; Study Goals</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleSave({ displayName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-ivory/50 text-espresso text-sm font-semibold focus:outline-none focus:border-espresso"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
              Daily Study Goal (Hours)
            </label>
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={formData.dailyGoalHours}
              onChange={(e) => handleSave({ dailyGoalHours: parseFloat(e.target.value) || 1 })}
              className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-ivory/50 text-espresso text-sm font-semibold focus:outline-none focus:border-espresso font-pixel"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
              Weekly Study Goal (Hours)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              step="1"
              value={formData.weeklyGoalHours}
              onChange={(e) => handleSave({ weeklyGoalHours: parseFloat(e.target.value) || 1 })}
              className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-ivory/50 text-espresso text-sm font-semibold focus:outline-none focus:border-espresso font-pixel"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: FOCUS TIMER PRESETS */}
      <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-espresso/10">
          <Clock className="w-5 h-5 text-sage" />
          <h3 className="font-bold text-lg text-espresso">Focus Timer Presets</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
              Pomodoro Focus Duration (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="180"
              value={formData.timer.pomodoroMinutes}
              onChange={(e) => handleTimerChange('pomodoroMinutes', parseInt(e.target.value) || 25)}
              className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-ivory/50 text-espresso text-sm font-semibold focus:outline-none focus:border-espresso font-pixel"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
              Long Break Frequency (Every N Pomodoros)
            </label>
            <select
              value={formData.timer.longBreakInterval}
              onChange={(e) => handleTimerChange('longBreakInterval', parseInt(e.target.value) || 4)}
              className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-ivory/50 text-espresso text-sm font-semibold focus:outline-none focus:border-espresso cursor-pointer"
            >
              <option value="2">Every 2 Pomodoros</option>
              <option value="3">Every 3 Pomodoros</option>
              <option value="4">Every 4 Pomodoros (Standard)</option>
              <option value="5">Every 5 Pomodoros</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: BREAK DURATIONS & SETTINGS */}
      <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-espresso/10">
          <Coffee className="w-5 h-5 text-cherry" />
          <h3 className="font-bold text-lg text-espresso">Break Settings (Only Breaks of Time)</h3>
        </div>

        <p className="text-xs text-espresso/60">
          Configure default break durations for your mental recovery periods.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
              Short Break (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={formData.timer.shortBreakMinutes}
              onChange={(e) => handleTimerChange('shortBreakMinutes', parseInt(e.target.value) || 5)}
              className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-ivory/50 text-espresso text-sm font-semibold focus:outline-none focus:border-espresso font-pixel"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
              Coffee Break (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={formData.timer.coffeeBreakMinutes || 10}
              onChange={(e) => handleTimerChange('coffeeBreakMinutes', parseInt(e.target.value) || 10)}
              className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-ivory/50 text-espresso text-sm font-semibold focus:outline-none focus:border-espresso font-pixel"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
              Long Break (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="90"
              value={formData.timer.longBreakMinutes}
              onChange={(e) => handleTimerChange('longBreakMinutes', parseInt(e.target.value) || 15)}
              className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-ivory/50 text-espresso text-sm font-semibold focus:outline-none focus:border-espresso font-pixel"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-espresso/5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.timer.autoStartBreaks}
              onChange={(e) => handleTimerChange('autoStartBreaks', e.target.checked)}
              className="w-4 h-4 rounded text-cherry focus:ring-cherry"
            />
            <span className="text-xs font-medium text-espresso">
              Auto-start break when focus session finishes
            </span>
          </label>
        </div>
      </div>

      {/* SECTION 4: SOUND & NOTIFICATIONS */}
      <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-espresso/10">
          <Volume2 className="w-5 h-5 text-blossom-dark" />
          <h3 className="font-bold text-lg text-espresso">Sound &amp; Notifications</h3>
        </div>

        <div className="space-y-4">
          {/* Sound Toggle & Volume */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-ivory/50 border border-espresso/10">
            <div>
              <div className="font-bold text-sm text-espresso">Sound Effects</div>
              <div className="text-xs text-espresso/60">
                Play zero-latency chiptune fanfare and relaxing chimes upon completion
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={formData.timer.soundVolume}
                disabled={!formData.timer.soundEnabled}
                onChange={(e) => handleTimerChange('soundVolume', parseFloat(e.target.value))}
                className="w-24 accent-espresso"
              />

              <button
                type="button"
                onClick={handleTestSound}
                className="px-3 py-1.5 rounded-xl border border-espresso/20 text-xs font-semibold text-espresso hover:bg-white transition"
              >
                Test Sound
              </button>

              <button
                type="button"
                onClick={() => handleTimerChange('soundEnabled', !formData.timer.soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  formData.timer.soundEnabled ? 'bg-sage' : 'bg-muted/40'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    formData.timer.soundEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Browser Notifications */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-ivory/50 border border-espresso/10">
            <div>
              <div className="font-bold text-sm text-espresso flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-espresso/70" />
                Browser Notifications
              </div>
              <div className="text-xs text-espresso/60">
                Receive notification alerts when timers end even if tab is in the background
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                formData.timer.notificationsEnabled ? 'bg-sage' : 'bg-muted/40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  formData.timer.notificationsEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: THEMES & ACCESSIBILITY */}
      <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-espresso/10">
          <Palette className="w-5 h-5 text-lavender-dark" />
          <h3 className="font-bold text-lg text-espresso">Aesthetic Themes &amp; Accessibility</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(
            [
              { id: 'cherry-blossom', label: 'Cherry Blossom', desc: 'Scenic pink lake' },
              { id: 'pixel-cherry', label: 'Pixel Cherry', desc: 'Minimal ivory grid' },
              { id: 'retro-crt', label: 'Retro CRT', desc: 'Rainbow CRT screen' },
              { id: 'paper-grid', label: 'Paper & Grid', desc: 'Editorial warm graph' },
              { id: 'midnight-focus', label: 'Midnight Focus', desc: 'Dark low distraction' },
            ] as const
          ).map(({ id, label, desc }) => (
            <button
              key={id}
              onClick={() => handleSave({ theme: id })}
              className={`p-3 rounded-2xl border text-left transition pixel-press ${
                formData.theme === id
                  ? 'bg-espresso text-ivory border-espresso shadow-pixel-sm'
                  : 'bg-ivory hover:bg-white text-espresso border-espresso/15 hover:border-espresso/35'
              }`}
            >
              <div className="text-xs font-bold">{label}</div>
              <div
                className={`text-[10px] mt-0.5 ${
                  formData.theme === id ? 'text-ivory/70' : 'text-espresso/50'
                }`}
              >
                {desc}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-espresso/5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.reducedMotion}
              onChange={(e) => handleSave({ reducedMotion: e.target.checked })}
              className="w-4 h-4 rounded text-cherry focus:ring-cherry"
            />
            <span className="text-xs font-medium text-espresso">
              Reduced-motion mode (minimizes transitions &amp; animations)
            </span>
          </label>
        </div>
      </div>

      {/* SECTION 6: DATA BACKUP & RESTORE */}
      <div className="bg-white rounded-3xl p-6 border border-espresso/15 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-espresso/10">
          <Download className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-lg text-espresso">Data Backup &amp; Portability</h3>
        </div>

        <p className="text-xs text-espresso/70">
          Export your study records and settings as a clean JSON backup to preserve your history.
        </p>

        {importStatus && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              importStatus.success
                ? 'bg-sage/20 text-sage-dark border border-sage/30'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => StorageService.exportToJson()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-espresso text-ivory text-xs font-semibold shadow-pixel-sm hover:translate-y-[-1px] transition pixel-press"
          >
            <Download className="w-4 h-4 text-blossom" />
            <span>Export Backup JSON</span>
          </button>

          <label className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-espresso/20 text-espresso text-xs font-semibold hover:bg-ivory cursor-pointer shadow-sm transition pixel-press">
            <Upload className="w-4 h-4 text-sage" />
            <span>Restore Backup JSON</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
