import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { SyncProvider} from './front/application/contexts/dbSyncContext'
import App from './front/App';
import reportWebVitals from './reportWebVitals';
import { GlobalStyle } from './front/styles/globalStyles'
import {
  BrowserRouter as Router,
} from "react-router-dom";

import { startDb } from './api/infrastructure/repositories/browser/browserdb'
import { worker } from './api/infrastructure/repositories/browser/browser';

let basepath = ''
if(process.env.REACT_APP_MOCK){
  const { worker } = require('./tests/mocks/browser')
  worker.start()
}else{
  const { worker } = require('./api/infrastructure/repositories/browser/browser')
  if(process.env.NODE_ENV === 'production'){
    worker.start({
      serviceWorker: {
        url: `${process.env.PUBLIC_URL}/mockServiceWorker.js`
      }
    })
    basepath= '/tasker'
  }else{
    worker.start()
  }
  startDb()
}

ReactDOM.render(
  <React.StrictMode>    
    <Router basename={basepath}>    
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
