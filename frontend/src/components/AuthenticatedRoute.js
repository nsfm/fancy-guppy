import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';

class AuthenticatedRoute extends Component {
  render() {
    const { component: Component, ...rest } = this.props;

    // Grab the token.
    const token = localStorage.getItem('token');

    // Check if it exists.
    const authenticated = token ? true : false;

    // TODO - Confirm that the token hasn't expired.
    // TODO - Set up token refresh.

    return (
      <Route
        {...rest}
        render={props => {
          // Pass the token along.
          props.token = token;
          return authenticated ? (
            <Component {...props} />
          ) : (
            <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
          );
        }}
      />
    );
  }
}

export default AuthenticatedRoute;
