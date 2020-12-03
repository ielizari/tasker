import React from 'react'
import {
    Switch,
    Route,
    useRouteMatch,
} from 'react-router-dom'

import { TaskDetailComponent } from '../components/tasks/task-detail.component'
import { TaskListComponent } from '../components/tasks/task-list.component'

export const TasksView = () => {
    let match = useRouteMatch();    
    return(
        <Switch>
            <Route path={`${match.path}/:taskid`}>
                <TaskDetailComponent />
            </Route>
            <Route path={`${match.path}`}>
                <TaskListComponent />
            </Route>
        </Switch>
    );
}