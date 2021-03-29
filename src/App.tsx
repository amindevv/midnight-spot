import React from 'react'
import {
  BrowserRouter as Router, Switch, Route, Link
} from "react-router-dom";
import Chart from './containers/Chart';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path='/complex' component={Chart} />
      </Switch>
    </Router>
  )
}

export default App