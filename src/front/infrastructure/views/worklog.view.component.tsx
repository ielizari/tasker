import React from 'react'
import {
    Switch,
    Route,
    useRouteMatch,
} from 'react-router-dom'
import { WorklogListComponent } from '../components/worklog/worklog-list.component'
import { WorklogNewComponent } from '../components/worklog/worklog-new.component'
import { WorklogDetailComponent } from '../components/worklog/worklog-detail.component'

export const WorklogView = () => {
    let match = useRouteMatch();    
    return(
        <Switch>            
             <Route path={`${match.path}/new`}>
                <WorklogNewComponent mode="new"/>
            </Route>
            <Route path={`${match.path}/edit/:worklogid`}>
                <WorklogNewComponent mode="edit"/>
            </Route>
            <Route path={`${match.path}/:worklogid`}>
                <WorklogDetailComponent />
            </Route>
            <Route path={`${match.path}`}>
                <WorklogListComponent />
            </Route>
        </Switch>
    );
}