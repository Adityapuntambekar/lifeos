export type Task = { id: string; title: string; category: string; done: boolean; due?: string }

export const initialTasks: Task[] = []

export const scores = [
  { name: 'Academics', value: 63, color: '#6f77dc' },
  { name: 'Exam readiness', value: 18, color: '#e6a15b' },
  { name: 'Programming', value: 24, color: '#4ca78e' },
  { name: 'AI / ML', value: 12, color: '#bb72bb' },
  { name: 'Study abroad', value: 8, color: '#5d9fc6' },
]

export const studyWeek = [32, 54, 45, 74, 42, 27, 15]
