export type TaskStatus = 'PENDING' | 'COMPLETED' | 'DISCARDED';

export interface CreateTaskInput {
  id?: string; // client-side form id only — server always generates the real task id
  title: string;
  description?: string;
  skill: string;
  priority?: string;
  dueDate?: string;
  subtasks?: CreateTaskInput[];
}

export interface UpdateTaskInput {
  id?: string; // present on existing subtasks in a nested `subtasks` array; omitted for new ones
  title?: string;
  description?: string;
  skill?: string;
  priority?: string;
  dueDate?: string;
  subtasks?: UpdateTaskInput[];
}

export interface GetTasksQuery {
  status?: TaskStatus;
  from?: string;
  to?: string;
}
