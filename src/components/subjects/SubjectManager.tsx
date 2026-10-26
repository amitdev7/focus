import React, { useState } from 'react';
import { Subject, StudySession } from '../../types';
import { Plus, Edit2, Trash2, BookOpen, Clock, Target, Play, Check } from 'lucide-react';
import { formatHoursMinutes } from '../../services/analytics';

interface SubjectManagerProps {
  subjects: Subject[];
  sessions: StudySession[];
  onAddSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onSelectForTimer: (subjectId: string) => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue (Math)
  '#10B981', // Emerald (Science)
  '#F59E0B', // Amber (English)
  '#8B5CF6', // Purple (Social Science)
  '#EC4899', // Pink (Hindi)
  '#06B6D4', // Cyan (Computer)
  '#E53945', // Cherry Red
  '#92AA7B', // Sage Green
  '#6366F1', // Indigo
  '#6B7280', // Gray (Other)
];

export const SubjectManager: React.FC<SubjectManagerProps> = ({
  subjects,
  sessions,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onSelectForTimer,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState<number | ''>(5);
  const [error, setError] = useState('');

  // Calculate subject metrics from real sessions
  const getSubjectMetrics = (subjectId: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Monday of current week
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);
    const mondayTs = monday.getTime();

    const subjectSessions = sessions.filter(
      (s) => s.subjectId === subjectId && s.actualDuration > 0 && s.mode !== 'shortBreak' && s.mode !== 'longBreak'
    );

    const totalSeconds = subjectSessions.reduce((acc, s) => acc + s.actualDuration, 0);
    const completedCount = subjectSessions.filter((s) => s.status === 'completed').length;

    const todaySeconds = subjectSessions
      .filter((s) => new Date(s.startTime).toISOString().split('T')[0] === todayStr)
      .reduce((acc, s) => acc + s.actualDuration, 0);

    const weekSeconds = subjectSessions
      .filter((s) => s.startTime >= mondayTs)
      .reduce((acc, s) => acc + s.actualDuration, 0);

    return {
      totalSeconds,
      completedCount,
      todaySeconds,
      weekSeconds,
    };
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setName('');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setWeeklyGoal(5);
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setColor(sub.color);
    setWeeklyGoal(sub.weeklyGoalHours || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a subject name');
      return;
    }

    if (editingSubject) {
      onEditSubject({
        ...editingSubject,
        name: name.trim(),
        color,
        weeklyGoalHours: typeof weeklyGoal === 'number' && weeklyGoal > 0 ? weeklyGoal : undefined,
      });
    } else {
      onAddSubject({
        name: name.trim(),
        color,
        weeklyGoalHours: typeof weeklyGoal === 'number' && weeklyGoal > 0 ? weeklyGoal : undefined,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
            Study Subjects
          </h2>
          <p className="text-sm text-espresso/60 mt-1">
            Track focused hours, configure weekly targets, and manage your courses.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-espresso text-ivory text-sm font-semibold shadow-pixel-sm hover:translate-y-[-1px] transition pixel-press"
        >
          <Plus className="w-4 h-4 text-blossom" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => {
          const metrics = getSubjectMetrics(sub.id);
          const goalSec = (sub.weeklyGoalHours || 0) * 3600;
          const goalProgress = goalSec > 0 ? Math.min(100, Math.round((metrics.weekSeconds / goalSec) * 100)) : null;

          return (
            <div
              key={sub.id}
              className="bg-white rounded-3xl p-5 border border-espresso/15 shadow-sm hover:shadow-editorial transition flex flex-col justify-between"
            >
              <div>
                {/* Header with Color Tag & Actions */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <h3 className="font-bold text-lg text-espresso truncate max-w-[160px]">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      title="Edit Subject"
                      className="p-1.5 text-espresso/50 hover:text-espresso rounded-lg hover:bg-espresso/5 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {subjects.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${sub.name}?`)) {
                            onDeleteSubject(sub.id);
                          }
                        }}
                        title="Delete Subject"
                        className="p-1.5 text-espresso/40 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics 2x2 Grid */}
                <div className="grid grid-cols-2 gap-2 my-4">
                  <div className="p-2.5 rounded-2xl bg-ivory/70 border border-espresso/10">
                    <div className="text-[10px] font-semibold uppercase text-espresso/50">Today</div>
                    <div className="text-base font-bold font-pixel text-espresso mt-0.5">
                      {formatHoursMinutes(metrics.todaySeconds)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-ivory/70 border border-espresso/10">
                    <div className="text-[10px] font-semibold uppercase text-espresso/50">This Week</div>
                    <div className="text-base font-bold font-pixel text-espresso mt-0.5">
                      {formatHoursMinutes(metrics.weekSeconds)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-ivory/70 border border-espresso/10">
                    <div className="text-[10px] font-semibold uppercase text-espresso/50">All-Time</div>
                    <div className="text-base font-bold font-pixel text-espresso mt-0.5">
                      {formatHoursMinutes(metrics.totalSeconds)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-ivory/70 border border-espresso/10">
                    <div className="text-[10px] font-semibold uppercase text-espresso/50">Sessions</div>
                    <div className="text-base font-bold font-pixel text-espresso mt-0.5">
                      {metrics.completedCount}
                    </div>
                  </div>
                </div>

                {/* Goal Progress Bar if weekly target is set */}
                {sub.weeklyGoalHours && sub.weeklyGoalHours > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-espresso/60 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-sage" />
                        Weekly Goal ({sub.weeklyGoalHours}h)
                      </span>
                      <span className="font-semibold text-espresso">{goalProgress}%</span>
                    </div>
                    <div className="w-full bg-espresso/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${goalProgress}%`,
                          backgroundColor: sub.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Start Timer CTA for this subject */}
              <button
                onClick={() => onSelectForTimer(sub.id)}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-espresso/15 text-xs font-semibold text-espresso hover:bg-ivory transition pixel-press"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Focus with {sub.name}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl p-6 shadow-2xl border-2 border-espresso">
            <h3 className="text-xl font-bold text-espresso mb-4">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics, World History, Organic Chem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-white text-espresso focus:outline-none focus:border-espresso"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-espresso/60 block mb-2">
                  Color Tag
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-125 border-espresso shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
                  Weekly Goal Target (Hours, optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 5"
                  value={weeklyGoal}
                  onChange={(e) =>
                    setWeeklyGoal(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-white text-espresso focus:outline-none focus:border-espresso"
                />
              </div>

              {error && <p className="text-xs text-cherry font-medium">{error}</p>}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-espresso/20 text-xs font-semibold text-espresso hover:bg-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-espresso text-ivory text-xs font-semibold shadow-pixel-sm hover:translate-y-[-1px] transition pixel-press"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
