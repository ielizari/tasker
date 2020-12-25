import React from 'react';
import './App.css';
import {  
  Switch,
  Route,
} from "react-router-dom";

import { Home } from './infrastructure/views/home.component'
import { Header } from './infrastructure/components/common/header'
import { DbSync } from './infrastructure/components/db-sync'
import { TasksView } from './infrastructure/views/tasks.view.component'
import { WorklogView } from './infrastructure/views/worklog.view.component'
import { hasDB } from '../api/infrastructure/repositories/browser/browserdb'
import { SetupApp } from './infrastructure/views/setup-app.component'
import { Settings } from './infrastructure/views/settings.component'

function App() {
  return (
    <>
    {!hasDB() ?
      <SetupApp />
    :
      <>
      <DbSync />
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
    </>
  );
}

function About() {
  return <h2>About</h2>;
}

export default App;
