import React from 'react';
import './App.css';
import styled from 'styled-components'
import { color } from './styles/theme'
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
import { About } from './infrastructure/views/about.component'

import { existsDb } from './application/existsDatabase'

import { RunningWorklogsProvider } from '../front/application/contexts/runningWorklogsContext'

const AppContainer = styled.div`
  background-color: ${color.background};
  min-height: 100%;
`
function App() {
  const syncCtx = React.useContext(SyncStateContext)
  const {sync, setSync} = syncCtx
  const [loading, setLoading] = React.useState<boolean>(false)
  
  React.useEffect(()=>{
      let cancelled = false
      setLoading(true)
      existsDb().then(
          result => {
            if(!cancelled){
                setLoading(false)
                if(!result.hasError){
                    setSync({sync:true, existsDb: result.data})
                }else{
                    setSync({sync:true, existsDb: false})
                }         
              }     
          },
          error => {
            if(!cancelled){
              setLoading(false)
              console.log(error)
              setSync({sync:true, existsDb: false})
            }
            
          }
      )

      return () => cancelled = true
  }, [setSync])

  return (
    <RunningWorklogsProvider>
      <AppContainer>
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
      </AppContainer>
    </RunningWorklogsProvider>
  );
}


export default App;
