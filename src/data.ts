export type Task = { id: string; title: string; category: string; done: boolean; due?: string }

export const initialTasks: Task[] = []

export const scores: {name:string;value:number;color:string}[] = []
export const studyWeek: number[] = []
