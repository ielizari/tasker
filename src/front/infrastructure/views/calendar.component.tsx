import {
  Switch,
  Route,
  useRouteMatch,
} from 'react-router-dom'
import { CalendarListComponent } from '../components/calendar/calendar-list.component'
import { CalendarNewComponent } from '../components/calendar/calendar-new.component'
import { CalendarDetailComponent } from '../components/calendar/calendar-detail.component'

export const CalendarView = () => {
let match = useRouteMatch();
return(
  <Switch>
    <Route path={`${match.path}/new`}>
      <CalendarNewComponent mode="new"/>
    </Route>
    <Route path={`${match.path}/edit/:calendarid`}>
      <CalendarNewComponent mode="edit"/>
    </Route>
    <Route path={`${match.path}/:calendarid`}>
      <CalendarDetailComponent />
    </Route>
    <Route path={`${match.path}`}>
      <CalendarListComponent />
    </Route>
  </Switch>
);
}