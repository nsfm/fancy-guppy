import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import './index.css';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import Login from './components/Login';
import About from './components/About';
import FileUpload from './components/FileUpload';
import AppBar from './components/AppBar';
import BottomNav from './components/BottomNav';

import * as serviceWorker from './serviceWorker';

// Logi
/*
const About = () => {
  return (
    <main>
      <h5>This is the index.</h5>
      <Link to="/login">Please log in.</Link>
      <FileUpload />
    </main>
  );
};
*/
// Set up routing.
ReactDOM.render(
  <Router>
    <div>
      <Route exact path="/login" component={Login} />
      <AuthenticatedRoute exact path="/app" component={AppBar} />
      <AuthenticatedRoute exact path="/app" component={BottomNav} />
      <AuthenticatedRoute path="/" component={FileUpload} />
      <Route path="/" component={About} />
    </div>
  </Router>,
  document.getElementById('root')
);

//ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
