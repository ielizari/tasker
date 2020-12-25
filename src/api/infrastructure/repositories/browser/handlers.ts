import { worklogHandlers } from './handlers/worklogs'
import { taskHandlers } from './handlers/tasks'
import { databaseHandlers } from './handlers/database'

export const handlers = [
    ...worklogHandlers,
    ...taskHandlers,
    ...databaseHandlers    
]