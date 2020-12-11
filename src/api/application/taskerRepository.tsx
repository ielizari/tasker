import { TaskDetail, TaskObject } from '../../domain/task-detail'
import { TaskItem } from '../../domain/task-list'

let repository: TaskerRepository

export interface TaskerRepository{
    newId(table: string): string
    getTasks(filter?: Partial<TaskDetail>): Array<TaskItem>
    addTask(task: TaskDetail): TaskObject
    getTaskById(id: string): TaskObject
    deleteTask(id: string): boolean 
    updateTask(task: TaskDetail): TaskObject
}

export function setTaskerRepository(repo: TaskerRepository){
    repository = repo
}

export function getTaskerRepository(): TaskerRepository {
    return repository
}