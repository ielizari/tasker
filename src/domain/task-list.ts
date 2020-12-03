export interface TaskList {
    id: string,
    title: string,
    description: string,
    createdDate: Date,
    limitDate: Date,    
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
    limitDate?: Date
}

export interface Job{
    id: string,
    parentTask: string,
    description: string,
    startDatetime: Date,
    endDatetime: Date,
    status: string
}