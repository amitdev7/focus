import React, { useState } from 'react';
import { Task, Subject, StudySession } from '../../types';
import { Plus, CheckCircle2, Circle, Play, Trash2, Clock, CheckSquare } from 'lucide-react';
import { formatHoursMinutes } from '../../services/analytics';

interface TaskManagerProps {
  tasks: Task[];
  subjects: Subject[];
  sessions: StudySession[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onStartTaskTimer: (taskId: string, subjectId: string, durationMinutes?: number) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  subjects,
  sessions,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onStartTaskTimer,
}) => {
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [targetMin, setTargetMin] = useState<number | ''>(45);
  const [error, setError] = useState('');

  // Calculate actual time spent on each task
  const getTaskSpentSec = (taskId: string) => {
    return sessions
      .filter((s) => s.taskId === taskId && s.actualDuration > 0)
      .reduce((acc, s) => acc + s.actualDuration, 0);
  };

  const handleOpenAdd = () => {
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setTargetMin(45);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }
    if (!subjectId) {
      setError('Please select a subject');
      return;
    }

    onAddTask({
      title: title.trim(),
      subjectId,
      targetDurationMinutes: typeof targetMin === 'number' && targetMin > 0 ? targetMin : undefined,
      completed: false,
    });

    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterSubjectId === 'all') return true;
    return t.subjectId === filterSubjectId;
  });

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
            Study Tasks
          </h2>
          <p className="text-sm text-espresso/60 mt-1">
            Break your study sessions down into concrete milestones and track task progress.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-espresso text-ivory text-sm font-semibold shadow-pixel-sm hover:translate-y-[-1px] transition pixel-press"
        >
          <Plus className="w-4 h-4 text-blossom" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filter Tabs by Subject */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterSubjectId('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            filterSubjectId === 'all'
              ? 'bg-espresso text-ivory shadow-pixel-sm'
              : 'bg-white text-espresso/70 border border-espresso/15 hover:border-espresso/40'
          }`}
        >
          All Subjects ({tasks.length})
        </button>
        {subjects.map((sub) => {
          const count = tasks.filter((t) => t.subjectId === sub.id).length;
          const isActive = filterSubjectId === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setFilterSubjectId(sub.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-espresso text-ivory shadow-pixel-sm'
                  : 'bg-white text-espresso/70 border border-espresso/15 hover:border-espresso/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
              <span>{sub.name}</span>
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Pending Tasks Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-espresso/50">
          In Progress ({pendingTasks.length})
        </h3>

        {pendingTasks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-espresso/10 text-center">
            <CheckSquare className="w-8 h-8 text-espresso/30 mx-auto mb-2" />
            <p className="text-sm font-medium text-espresso/60">No pending tasks for this filter.</p>
            <p className="text-xs text-espresso/40 mt-1">Ready to create a new study target?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingTasks.map((task) => {
              const sub = subjects.find((s) => s.id === task.subjectId);
              const spentSec = getTaskSpentSec(task.id);
              const targetSec = (task.targetDurationMinutes || 0) * 60;
              const progressPct = targetSec > 0 ? Math.min(100, Math.round((spentSec / targetSec) * 100)) : null;

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl p-4 border border-espresso/15 shadow-sm hover:shadow-editorial transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="mt-0.5 text-espresso/30 hover:text-sage transition"
                          title="Mark complete"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <div>
                          <h4 className="font-bold text-sm text-espresso leading-snug">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: sub?.color || '#3B82F6' }}
                            />
                            <span className="text-[11px] font-semibold text-espresso/70">
                              {sub?.name || 'Subject'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-espresso/30 hover:text-rose-600 transition p-1"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Target & Spent Progress */}
                    {task.targetDurationMinutes && (
                      <div className="mt-3 pt-2.5 border-t border-espresso/5">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-espresso/50 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Time: {formatHoursMinutes(spentSec)} / {task.targetDurationMinutes}m
                          </span>
                          <span className="font-semibold text-espresso">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-espresso/5 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-sage h-full rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Start Focus on Task */}
                  <div className="mt-3 pt-2 border-t border-espresso/5 flex items-center justify-end">
                    <button
                      onClick={() => onStartTaskTimer(task.id, task.subjectId, task.targetDurationMinutes)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ivory hover:bg-espresso hover:text-ivory text-espresso text-xs font-semibold border border-espresso/15 transition pixel-press"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Focus on Task</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-espresso/40">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => {
              const sub = subjects.find((s) => s.id === task.subjectId);
              const spentSec = getTaskSpentSec(task.id);
              return (
                <div
                  key={task.id}
                  className="bg-white/60 rounded-xl p-3 border border-espresso/10 flex items-center justify-between opacity-75 hover:opacity-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-sage hover:text-espresso transition"
                      title="Mark pending"
                    >
                      <CheckCircle2 className="w-5 h-5 fill-sage/20" />
                    </button>
                    <div>
                      <span className="text-sm font-medium line-through text-espresso/60">
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sub?.color || '#92AA7B' }} />
                        <span className="text-[10px] text-espresso/50">{sub?.name}</span>
                        {spentSec > 0 && (
                          <span className="text-[10px] text-espresso/40">• {formatHoursMinutes(spentSec)} logged</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-espresso/30 hover:text-rose-600 transition p-1"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl p-6 shadow-2xl border-2 border-espresso">
            <h3 className="text-xl font-bold text-espresso mb-4">Add Study Task</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete NCERT Exercise 3.2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-white text-espresso focus:outline-none focus:border-espresso text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-white text-espresso focus:outline-none focus:border-espresso text-sm cursor-pointer"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
                  Target Duration (Minutes, optional)
                </label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  placeholder="e.g. 45"
                  value={targetMin}
                  onChange={(e) =>
                    setTargetMin(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 0))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-white text-espresso focus:outline-none focus:border-espresso text-sm"
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
