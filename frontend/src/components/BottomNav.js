import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import RestoreIcon from '@material-ui/icons/AlternateEmail';
import FavoriteIcon from '@material-ui/icons/AddAPhoto';
import LocationOnIcon from '@material-ui/icons/Collections';

// TODO: Menu drawer is 200px, hence the breakpoints
const styles = theme => ({
  stickToBottom: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    marginLeft: '0px',
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - 200px)`,
      marginLeft: '200px'
    }
  }
});

class SimpleBottomNavigation extends React.Component {
  state = {
    value: 0
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <BottomNavigation value={value} onChange={this.handleChange} showLabels className={classes.stickToBottom}>
        <BottomNavigationAction label="Shorten URL" icon={<RestoreIcon />} />
        <BottomNavigationAction label="Upload Image" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Gallery" icon={<LocationOnIcon />} />
      </BottomNavigation>
    );
  }
}

SimpleBottomNavigation.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(SimpleBottomNavigation);
