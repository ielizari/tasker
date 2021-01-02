import { worklogHandlers } from './handlers/worklogs'
import { taskHandlers } from './handlers/tasks'
import { jobHandlers } from './handlers/jobs'
import { databaseHandlers } from './handlers/database'

export const handlers = [
    ...worklogHandlers,
    ...taskHandlers,
    ...jobHandlers,
    ...databaseHandlers    
]