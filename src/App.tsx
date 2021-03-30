import React from 'react'
import {
  BrowserRouter as Router, Switch, Route
} from "react-router-dom";
import Chart from './containers/Chart';
import AppBar from '@material-ui/core/AppBar';
import './index.css';

const App = () => {
  return (
    <div>
      <AppBar title='shatter' />
      <div>
        <Router>
          <Switch>
            <Route exact path='/complex' component={Chart} />
          </Switch>
        </Router>
      </div>
    </div>
  )
}

export default App