import { Job } from './job'

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
