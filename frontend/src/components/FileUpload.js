// Taken from the Material UI examples.

import React from 'react';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import axios from 'axios';

const styles = {
  appBar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  }
};

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box'
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%'
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  padding: '2.5em 0',
  background: 'rgba(0,0,0,0.5)',
  textAlign: 'center',
  color: '#fff'
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class FileUpload extends React.Component {
  constructor() {
    super();
    this.state = {
      accept: 'image/*',
      files: [],
      open: false
    };
  }

  onDrop(files) {
    this.setState({
      files: files.map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      ),
      open: files.length
    });
  }

  componentWillUnmount() {
    // Make sure to revoke the data uris to avoid memory leaks
    this.state.files.forEach(file => URL.revokeObjectURL(file.preview));
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;
    const { accept } = this.state;

    const files = this.state.files.map((file, index) => (
      <div>
        <ListItem>
          <ListItemAvatar>
            <Avatar alt={file.name} src={file.preview} />
          </ListItemAvatar>
          <ListItemText primary={file.name} secondary={`${file.size} bytes`} />
          <ListItemSecondaryAction>
            <Checkbox />
          </ListItemSecondaryAction>
        </ListItem>
        <Divider />
      </div>
    ));

    return (
      <Dropzone accept={accept} onDrop={this.onDrop.bind(this)}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div {...getRootProps({ onClick: evt => evt.preventDefault() })} style={{ position: 'relative' }}>
            <input {...getInputProps()} />
            {isDragActive && <div style={overlayStyle}>Drop files here</div>}
            <h4>Files</h4>
            <Dialog fullScreen open={this.state.open} onClose={this.handleClose} TransitionComponent={Transition}>
              <AppBar className={classes.appBar}>
                <Toolbar>
                  <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="h6" color="inherit" className={classes.flex}>
                    Upload Images
                  </Typography>
                  <Button color="inherit" onClick={this.handleClose}>
                    upload
                  </Button>
                </Toolbar>
              </AppBar>
              <List>{files}</List>
            </Dialog>
          </div>
        )}
      </Dropzone>
    );
  }
}

FileUpload.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(FileUpload);
