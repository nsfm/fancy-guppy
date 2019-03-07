// Taken from the Material UI examples.

import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import axios from 'axios';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit
  },
  submit: {
    marginTop: theme.spacing.unit * 3
  }
});

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      successful_login: false,
      failed_login: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  render() {
    console.log(this.props.classes);
    const { classes } = this.props;

    if (this.state.successful_login) {
      return <Redirect to="/app" />;
    }

    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} onSubmit={this.submit}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="email">Email Address</InputLabel>
              <Input className="email" name="email" autoComplete="email" autoFocus onChange={this.handleChange} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="password">Password</InputLabel>
              <Input
                name="password"
                type="password"
                className="password"
                autoComplete="current-password"
                onChange={this.handleChange}
              />
            </FormControl>
            <Button fullWidth variant="contained" color="primary" className={classes.submit} type="submit">
              Sign in
            </Button>
          </form>
        </Paper>
      </main>
    );
  }

  async handleChange(event) {
    await this.setState({ [event.target.name]: event.target.value });
    console.log(this.state);
  }

  async submit(event) {
    console.log(event);
    event.preventDefault();

    // Tokens can be acquired by username or email.

    const request = {
      username: this.state.email,
      password: this.state.password
    };

    let result;
    try {
      result = await axios.post('http://localhost:56700/tokens', request);
      localStorage.setItem('token', result.token);
      await this.setState({ successful_login: true });
    } catch (err) {
      console.log(err);
      await this.setState({ failed_login: true });
    }
  }
}

LoginForm.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(LoginForm);
