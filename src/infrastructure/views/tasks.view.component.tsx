import React from 'react'
import {
    Switch,
    Route,
    useRouteMatch,
} from 'react-router-dom'

import { TaskDetailComponent } from '../components/tasks/task-detail.component'
import { TaskListComponent } from '../components/tasks/task-list.component'
import { TaskNewComponent } from '../components/tasks/task-new.component'

export const TasksView = () => {
    let match = useRouteMatch();    
    return(
        <Switch>
            <Route path={`${match.path}/new/:taskid`}>
                <TaskNewComponent mode="child" />
            </Route>
             <Route path={`${match.path}/new`}>
                <TaskNewComponent mode="new"/>
            </Route>
            <Route path={`${match.path}/edit/:taskid`}>
                <TaskNewComponent mode="edit"/>
            </Route>
            <Route path={`${match.path}/:taskid`}>
                <TaskDetailComponent />
            </Route>
            <Route path={`${match.path}`}>
                <TaskListComponent />
            </Route>
        </Switch>
    );
}