import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/api/tasks.api";
import {
  CreateTaskPayload,
  EditTaskPayload,
  DeleteTaskPayload,
  TaskStatus,
} from "@/types/tasks.types";

export const useTasksByDateQuery = (date: string) => {
  return useQuery({
    queryKey: ["tasks", "by-date", date],
    queryFn: () => tasksApi.getTasksByDate({ date }),
    enabled: !!date,
  });
};

export const useTasksCountSummaryQuery = () => {
  return useQuery({
    queryKey: ["tasks", "count-summary"],
    queryFn: () => tasksApi.getTasksCountSummary(),
  });
};

export const useWeeklyTasksQuery = (status?: TaskStatus) => {
  return useQuery({
    queryKey: ["tasks", "weekly", status],
    queryFn: () => tasksApi.getWeeklyTasksByStatus({ status }),
  });
};

export const useSearchTasksQuery = (searchQuery: string) => {
  return useQuery({
    queryKey: ["tasks", "search", searchQuery],
    queryFn: () => tasksApi.searchTasks(searchQuery),
    enabled: searchQuery.trim().length > 0,
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useEditTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EditTaskPayload) => tasksApi.editTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteTaskPayload) => tasksApi.deleteTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
