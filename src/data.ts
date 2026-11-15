export type Task = { id: string; title: string; category: string; done: boolean; due?: string }

export const initialTasks: Task[] = [
  { id: 't1', title: 'Map R Programming units for end-terms', category: 'Academics', done: false, due: '2026-11-18' },
  { id: 't2', title: 'Solve today’s DSA problem', category: 'Coding', done: false },
  { id: 't3', title: 'Prepare questions for Chalmers fair', category: 'Abroad', done: false, due: '2026-12-06' },
  { id: 't4', title: 'Archive ICCUBEA 2026 presentation', category: 'Research', done: true },
]

export const scores = [
  { name: 'Academics', value: 63, color: '#6f77dc' },
  { name: 'Exam readiness', value: 18, color: '#e6a15b' },
  { name: 'Programming', value: 24, color: '#4ca78e' },
  { name: 'AI / ML', value: 12, color: '#bb72bb' },
  { name: 'Study abroad', value: 8, color: '#5d9fc6' },
]

export const studyWeek = [32, 54, 45, 74, 42, 27, 15]
