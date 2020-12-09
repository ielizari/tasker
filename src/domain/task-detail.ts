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