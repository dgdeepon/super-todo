import axios from "axios";
import {
  Task,
  CreateTaskPayload,
  EditTaskPayload,
  DeleteTaskPayload,
  TasksByDatePayload,
  WeeklyTasksPayload,
  TaskCountSummary,
  WeeklyTasksGrouped,
  ApiSuccess,
} from "@/types/tasks.types";

export const tasksApi = {
  createTask: async (
    payload: CreateTaskPayload
  ): Promise<ApiSuccess<Record<string, never>>> => {
    const { data } = await axios.post("/api/tasks", payload);
    return data;
  },

  editTask: async (
    payload: EditTaskPayload
  ): Promise<ApiSuccess<Record<string, never>>> => {
    const { data } = await axios.put("/api/tasks", payload);
    return data;
  },

  deleteTask: async (
    payload: DeleteTaskPayload
  ): Promise<ApiSuccess<Record<string, never>>> => {
    const { data } = await axios.delete("/api/tasks", { data: payload });
    return data;
  },

  searchTasks: async (
    searchQuery: string
  ): Promise<ApiSuccess<{ tasks: Task[] }>> => {
    const { data } = await axios.get("/api/tasks/search", {
      params: { q: searchQuery },
    });
    return data;
  },

  getTasksByDate: async (
    payload: TasksByDatePayload
  ): Promise<ApiSuccess<{ tasks: Task[] }>> => {
    const { data } = await axios.post("/api/tasks/by-date", payload);
    return data;
  },

  getTasksCountSummary: async (): Promise<
    ApiSuccess<{ summary: TaskCountSummary }>
  > => {
    const { data } = await axios.get("/api/tasks/count-summary");
    return data;
  },

  getWeeklyTasksByStatus: async (
    payload: WeeklyTasksPayload
  ): Promise<ApiSuccess<{ groupedByDate: WeeklyTasksGrouped }>> => {
    const { data } = await axios.post("/api/tasks/weekly", payload);
    return data;
  },
};
