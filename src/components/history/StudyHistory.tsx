import React, { useState } from 'react';
import { StudySession, Subject, Task } from '../../types';
import { Download, Filter, Trash2, Edit3, Calendar, Clock, BookOpen, CheckSquare, Search, AlertCircle } from 'lucide-react';
import { formatHoursMinutes, formatDuration } from '../../services/analytics';
import { StorageService } from '../../services/storage';

interface StudyHistoryProps {
  sessions: StudySession[];
  subjects: Subject[];
  tasks: Task[];
  onDeleteSession: (sessionId: string) => void;
  onEditSession: (session: StudySession) => void;
}

export const StudyHistory: React.FC<StudyHistoryProps> = ({
  sessions,
  subjects,
  tasks,
  onDeleteSession,
  onEditSession,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [editDurationMin, setEditDurationMin] = useState<number>(25);
  const [editSubjectId, setEditSubjectId] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const subjectsMap = new Map(subjects.map((s) => [s.id, s]));
  const tasksMap = new Map(tasks.map((t) => [t.id, t]));

  // Date range boundary filtering
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const currentDayOfWeek = now.getDay();
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.getTime();

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredSessions = sessions.filter((s) => {
    // Subject filter
    if (filterSubject !== 'all' && s.subjectId !== filterSubject) return false;

    // Date filter
    if (filterDateRange === 'today' && s.startTime < todayStart) return false;
    if (filterDateRange === 'week' && s.startTime < weekStart) return false;
    if (filterDateRange === 'month' && s.startTime < monthStart) return false;

    return true;
  }).sort((a, b) => b.startTime - a.startTime); // newest first

  const totalFilteredSeconds = filteredSessions.reduce((acc, s) => acc + s.actualDuration, 0);

  const handleStartEdit = (session: StudySession) => {
    setEditingSession(session);
    setEditDurationMin(Math.round(session.actualDuration / 60));
    setEditSubjectId(session.subjectId);
    setEditNotes(session.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    const updated: StudySession = {
      ...editingSession,
      actualDuration: Math.max(1, editDurationMin * 60),
      subjectId: editSubjectId,
      notes: editNotes.trim() || undefined,
    };

    onEditSession(updated);
    setEditingSession(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-espresso tracking-tight">
            Study History
          </h2>
          <p className="text-sm text-espresso/60 mt-1">
            Complete audit trail of every focused block and study milestone.
          </p>
        </div>

        <button
          onClick={() => StorageService.exportSessionsToCsv()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-espresso/20 text-espresso text-sm font-semibold hover:bg-ivory shadow-sm transition pixel-press"
        >
          <Download className="w-4 h-4 text-cherry" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-espresso/15 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Date Range Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(
            [
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilterDateRange(id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                filterDateRange === id
                  ? 'bg-espresso text-ivory shadow-pixel-sm'
                  : 'bg-ivory text-espresso/70 hover:bg-espresso/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Subject Dropdown & Filter Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-ivory px-3 py-1.5 rounded-full border border-espresso/15 text-xs">
            <Filter className="w-3.5 h-3.5 text-espresso/50" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-transparent font-semibold text-espresso focus:outline-none cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold text-espresso/60 hidden sm:block">
            {filteredSessions.length} sessions ({formatHoursMinutes(totalFilteredSeconds)})
          </div>
        </div>
      </div>

      {/* Sessions Table / List */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-espresso/10 text-center">
          <Calendar className="w-10 h-10 text-espresso/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-espresso">No sessions found</h3>
          <p className="text-xs text-espresso/50 mt-1 max-w-sm mx-auto">
            No study sessions matched your selected filter. Start a focus session from the timer to build your history!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-espresso/15 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-espresso/10 bg-ivory/50 text-[11px] font-bold uppercase tracking-wider text-espresso/50">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/5 text-sm">
                {filteredSessions.map((session) => {
                  const subject = subjectsMap.get(session.subjectId);
                  const task = session.taskId ? tasksMap.get(session.taskId) : null;
                  const startDate = new Date(session.startTime);

                  return (
                    <tr key={session.id} className="hover:bg-ivory/40 transition">
                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-espresso text-xs">
                          {startDate.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-espresso/50">
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: subject?.color || '#92AA7B' }}
                          />
                          <span className="font-semibold text-espresso text-xs">
                            {subject?.name || 'General'}
                          </span>
                        </div>
                      </td>

                      {/* Task */}
                      <td className="py-3 px-4 max-w-xs truncate text-xs">
                        {task ? (
                          <span className="text-espresso/80 truncate block">{task.title}</span>
                        ) : (
                          <span className="text-espresso/30 italic">—</span>
                        )}
                        {session.notes && (
                          <div className="text-[10px] text-espresso/50 truncate italic mt-0.5">
                            "{session.notes}"
                          </div>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-espresso font-pixel text-xs">
                          {formatDuration(session.actualDuration)}
                        </span>
                        {session.plannedDuration !== session.actualDuration && (
                          <span className="text-[10px] text-espresso/40 ml-1.5">
                            (planned {Math.round(session.plannedDuration / 60)}m)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            session.status === 'completed'
                              ? 'bg-sage/20 text-sage-dark'
                              : session.status === 'manual_stop'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {session.status === 'completed'
                            ? 'Completed'
                            : session.status === 'manual_stop'
                            ? 'Manual Stop'
                            : 'Interrupted'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(session)}
                            title="Edit session"
                            className="p-1.5 text-espresso/40 hover:text-espresso rounded-lg hover:bg-espresso/5 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this study session record? This cannot be undone.')) {
                                onDeleteSession(session.id);
                              }
                            }}
                            title="Delete session"
                            className="p-1.5 text-espresso/40 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-ivory rounded-3xl p-6 shadow-2xl border-2 border-espresso">
            <h3 className="text-xl font-bold text-espresso mb-4">Edit Session Record</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
                  Subject
                </label>
                <select
                  value={editSubjectId}
                  onChange={(e) => setEditSubjectId(e.target.value)}
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
                  Focused Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={editDurationMin}
                  onChange={(e) => setEditDurationMin(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-white text-espresso focus:outline-none focus:border-espresso text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-espresso/60 block mb-1">
                  Session Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 problem set"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-espresso/20 bg-white text-espresso focus:outline-none focus:border-espresso text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-espresso/20 text-xs font-semibold text-espresso hover:bg-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-espresso text-ivory text-xs font-semibold shadow-pixel-sm hover:translate-y-[-1px] transition pixel-press"
                >
                  Save Corrections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
