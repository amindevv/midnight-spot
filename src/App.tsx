import React from 'react'
import { BrowserRouter as Router, useRoutes, Routes, Route } from "react-router-dom";
import { ThemeProvider, createMuiTheme, colors } from '@material-ui/core';
import GlobalStyles from './containers/GlobalStyles';
import routes from './routes';
//import theme from './theme';
import typography from './theme/typography';
import shadows from './theme/shadows';

const theme = {
  palette: {
    background: {
      default: '#F4F6F8',
      paper: '#141822'
    },
    primary: {
      contrastText: '#ffffff',
      main: '#fdbf00'
    },
    text: {
      primary: '#172b4d',
      secondary: '#6b778c'
    }
  },
  typography: typography
};

const appTheme = createMuiTheme(theme)
const App = () => {
  const routing = useRoutes(routes);
  return (
    <ThemeProvider theme={appTheme}>
      <GlobalStyles />
      {routing}
    </ThemeProvider>
  );
}

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default AppWrapper