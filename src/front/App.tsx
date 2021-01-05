import React from 'react';
import './App.css';
import {  
  Switch,
  Route,
} from "react-router-dom";

import { SyncStateContext } from './application/contexts/dbSyncContext'

import { Spinner } from './infrastructure/components/common/spinner'
import { Home } from './infrastructure/views/home.component'
import { Header } from './infrastructure/components/common/header'
import { TasksView } from './infrastructure/views/tasks.view.component'
import { WorklogView } from './infrastructure/views/worklog.view.component'
import { SetupApp } from './infrastructure/views/setup-app.component'
import { Settings } from './infrastructure/views/settings.component'

import { existsDb } from './application/existsDatabase'

import { RunningWorklogsProvider } from '../front/application/contexts/runningWorklogsContext'
import { RunningWorklogsWidget } from './infrastructure/components/worklog/worklog-running.component'


function App() {
  const syncCtx = React.useContext(SyncStateContext)
  const {sync, setSync} = syncCtx
  const [loading, setLoading] = React.useState<boolean>(false)
  
  React.useEffect(()=>{
      setLoading(true)
      existsDb().then(
          result => {
              if(!result.hasError){
                  setSync({sync:true, existsDb: result.data})
              }else{
                  setSync({sync:true, existsDb: false})
              }
              setLoading(false)
          },
          error => {
            console.log(error)
            setSync({sync:true, existsDb: false})
            setLoading(false)
          }
      )
  }, [])

  return (
    <RunningWorklogsProvider>
    
      {loading ? <Spinner /> : ''}     

      {!sync.existsDb ?
        <SetupApp />
      :
        <>
        <Header/>        
        <Switch>
            <Route path="/about">
              <About />
            </Route>    
            <Route path="/settings">
              <Settings />
            </Route>           
            <Route path="/tasks">
              <TasksView />
            </Route>
            <Route path="/worklogs">
              <WorklogView />
            </Route>
            <Route path="/">
              <Home />
            </Route>
        </Switch>
        </>
      }
    </RunningWorklogsProvider>
  );
}

function About() {
  return <h2>About</h2>;
}

export default App;
