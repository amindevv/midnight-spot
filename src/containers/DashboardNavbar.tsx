import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  AppBar,
  Badge,
  Box,
  Hidden,
  IconButton,
  Toolbar,
  Typography,
  useTheme
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import InputIcon from '@material-ui/icons/Input';
import Logo from './Logo';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  toolbar: {
    backgroundColor: '#141822'
  },
  logo: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}))

const DashboardNavbar = ({ onMobileNavOpen, ...rest }) => {
  const classes = useStyles()
  const [notifications] = useState([]);

  return (
    <AppBar
      elevation={8}
      {...rest}
    >
      <Toolbar className={classes.toolbar}>
        <RouterLink to="/">
          <Box className={classes.logo}>
            <Logo />
            <Typography variant='h2' color='primary'>Shatter</Typography>
          </Box>
        </RouterLink>
        <Box sx={{ flexGrow: 1 }} />
        <Hidden lgDown>
          <IconButton color="inherit">
            <Badge
              badgeContent={notifications.length}
              color="primary"
              variant="dot"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit">
            <InputIcon />
          </IconButton>
        </Hidden>
        <Hidden lgUp>
          <IconButton
            color="inherit"
            onClick={onMobileNavOpen}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};

DashboardNavbar.propTypes = {
  onMobileNavOpen: PropTypes.func
};

export default DashboardNavbar;
