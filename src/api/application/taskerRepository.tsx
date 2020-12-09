import { TaskDetail, TaskObject } from '../../domain/task-detail'
import { TaskItem } from '../../domain/task-list'

let repository: TaskerRepository

export interface TaskerRepository{
    newId(table: string): string
    getTasks(): Array<TaskItem>
    addTask(task: TaskDetail): TaskDetail
    getTaskById(id: string): TaskObject
    deleteTask(id: string): boolean 
}

export function setTaskerRepository(repo: TaskerRepository){
    repository = repo
}

export function getTaskerRepository(): TaskerRepository {
    return repository
}