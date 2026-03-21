import type { GanttTask } from '../../core/types';
import { toDate, daysBetween } from '../../core/utils';

export interface ScheduleResult {
  tasks: GanttTask[];
  criticalPath: string[];
  conflicts: { resource: string; tasks: [string, string] }[];
}

export function computeSchedule(tasks: GanttTask[]): ScheduleResult {
  const map = new Map(tasks.map(t => [t.id, t]));
  const criticalPath = findCriticalPath(tasks, map);
  const conflicts = findResourceConflicts(tasks);
  return { tasks, criticalPath, conflicts };
}

function findCriticalPath(tasks: GanttTask[], map: Map<string, GanttTask>): string[] {
  const endTimes = new Map<string, number>();
  const sorted = topologicalSort(tasks);
  const prev = new Map<string, string>();

  for (const task of sorted) {
    const start = toDate(task.start).getTime();
    const end = toDate(task.end).getTime();
    const dur = end - start;
    let earliest = start;
    for (const dep of task.dependencies || []) {
      const depEnd = endTimes.get(dep) || 0;
      if (depEnd > earliest) { earliest = depEnd; prev.set(task.id, dep); }
    }
    endTimes.set(task.id, earliest + dur);
  }

  // Find task with latest end time
  let maxEnd = 0, maxId = '';
  for (const [id, end] of endTimes) { if (end > maxEnd) { maxEnd = end; maxId = id; } }

  const path: string[] = [];
  let current: string | undefined = maxId;
  while (current) { path.unshift(current); current = prev.get(current); }
  return path;
}

function topologicalSort(tasks: GanttTask[]): GanttTask[] {
  const visited = new Set<string>();
  const result: GanttTask[] = [];
  const map = new Map(tasks.map(t => [t.id, t]));

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const task = map.get(id);
    if (!task) return;
    for (const dep of task.dependencies || []) visit(dep);
    result.push(task);
  }

  for (const task of tasks) visit(task.id);
  return result;
}

function findResourceConflicts(tasks: GanttTask[]): { resource: string; tasks: [string, string] }[] {
  const byResource = new Map<string, GanttTask[]>();
  for (const t of tasks) {
    if (!t.resource) continue;
    if (!byResource.has(t.resource)) byResource.set(t.resource, []);
    byResource.get(t.resource)!.push(t);
  }

  const conflicts: { resource: string; tasks: [string, string] }[] = [];
  for (const [res, resTasks] of byResource) {
    for (let i = 0; i < resTasks.length; i++) {
      for (let j = i + 1; j < resTasks.length; j++) {
        const a = resTasks[i], b = resTasks[j];
        const aStart = toDate(a.start).getTime(), aEnd = toDate(a.end).getTime();
        const bStart = toDate(b.start).getTime(), bEnd = toDate(b.end).getTime();
        if (aStart < bEnd && bStart < aEnd) {
          conflicts.push({ resource: res, tasks: [a.id, b.id] });
        }
      }
    }
  }
  return conflicts;
}
