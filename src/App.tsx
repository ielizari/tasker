import React from 'react';
import './App.css';
import {  
  Switch,
  Route,
} from "react-router-dom";

import { Home } from './infrastructure/views/home.component'
import { Header } from './infrastructure/components/common/header'
import { TasksView } from './infrastructure/views/tasks.view.component'
import { WorklogView } from './infrastructure/views/worklog.view.component'

function App() {
  return (
    <>
      <Header/>
      <Switch>
          <Route path="/about">
            <About />
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
  );
}

function About() {
  return <h2>About</h2>;
}

export default App;
