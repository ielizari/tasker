import { Job } from './job'

export const TaskStatus = {
    pending:        { label: "Pendiente",   value: "1"},
    incomplete:     { label: "Incompleto",  value: "2"},
    completed:      { label: "Completado",  value: "3"},
    cancelled:      { label: "Cancelado",   value: "4"},
}

export const TaskPriority = {
    low:        { label: "Baja",    value: "1"},
    medum:      { label: "Media",   value: "2"},
    high:       { label: "Alta",    value: "3"},
    extreme:    { label: "Extrema", value: "4"}
}

export const ConstObjectToSelectOptionsArray = (object) => {
    let result = []
    Object.keys(object).forEach((item)=>{
        result.push(object[item])
    })
    return result
}

export interface TaskList {
    id: string,
    title: string,
    description: string,
    createdDate: string,
    limitDate: string,    
    author: string,
    authorId: string,
    status: string,
    priority: string,
    tags: Array<string>,
    jobs: Array<Job>
}

export interface TaskItem {
    id: string,
    title: string,
    limitDate?: string
}

export interface TaskDetail {
    id: string,
    parent: string,
    title: string,
    description: string,
    createdDate: string,
    limitDate: string,
    author: string,
    authorId: string,
    status: string,
    priority: string,
    tags: Array<string>
}

export interface TaskObject {
    task: TaskDetail,
    parentTask: TaskDetail | null,
    childTasks: Array<TaskDetail>
}