import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './front/App';
import reportWebVitals from './reportWebVitals';
import { GlobalStyle } from './front/styles/globalStyles'
import {
  BrowserRouter as Router,
} from "react-router-dom";
import { initDB } from './api/infrastructure/repositories/browser/browserdb'
import { SyncProvider} from './front/application/contexts/dbSyncContext'

if(process.env.REACT_APP_MOCK){
  const { worker } = require('./front/tests/mocks/browser')
  worker.start()
}else{
  const { worker } = require('./api/infrastructure/repositories/browser/browser')
  worker.start()
  initDB()
}



ReactDOM.render(
  <React.StrictMode>    
    <Router>    
      <GlobalStyle/>
      <SyncProvider>
        <App />
      </SyncProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
