export interface TaskDetail {
    id?: string,
    parent?: string,
    title?: string,
    description?: string,
    createdDate?: Date,
    limitDate?: Date
    author?: string,
    authorId?: string,
    status?: string,
    priority?: string,
    tags?: Array<string>
}