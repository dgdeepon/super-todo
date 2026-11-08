export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "in_progress" | "completed";

export interface ApiSuccess<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface Task {
  id: string;
  authId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  date: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  date: string;
  time: string;
}

export interface EditTaskPayload extends Partial<CreateTaskPayload> {
  id: string;
}

export interface DeleteTaskPayload {
  id: string;
}

export interface TasksByDatePayload {
  date: string;
}

export interface WeeklyTasksPayload {
  status?: TaskStatus;
}

export interface TaskCountSummary {
  completed: number;
  pending: number;
  total: number;
}

export interface WeeklyTasksGrouped {
  [date: string]: Task[];
}
