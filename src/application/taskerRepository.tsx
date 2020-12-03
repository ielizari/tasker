import { TaskDetail } from '../domain/task-detail'
import { TaskItem } from '../domain/task-list'

export interface TaskerRepository{
    getTasks(): Array<TaskItem>
    addTask(task: TaskDetail): number | string
    getTaskById(id: string): TaskDetail
}