import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import { Typography, Button } from '@material-ui/core';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

class GameScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit() {
    const { onSubmitChoice } = this.props;
    const { value } = this.state;
    onSubmitChoice(value);
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({ value: event.target.value});
  }

  renderList() {
    const { stepName, personalChoice, opponentChoice, gameResult } = this.props;

    const optionsBoxes = () => {
      return (
        <FormControl component="fieldset">
          <FormLabel component="legend">Options</FormLabel>
          <RadioGroup row aria-label="position" name="position" defaultValue="top">
            <FormControlLabel
                value="Rock"
                control={<Radio color="secondary" />}
                label="Rock"
                labelPlacement="bottom"
                onChange={this.handleChange}
            />
            <FormControlLabel
              value="Paper"
              control={<Radio color="secondary" />}
              label="Paper"
              labelPlacement="bottom"
              onChange={this.handleChange}
            />
            <FormControlLabel
              value="Scissors"
              control={<Radio color="secondary" />}
              label="Scissors"
              labelPlacement="bottom"
              onChange={this.handleChange}
            />
          </RadioGroup>
          <Button type="submit" onClick={this.handleSubmit} variant="outlined" color="primary" style={{ width: '250px'}}>
            Submit answer
          </Button>
        </FormControl>
        
      );
    } 
    
    return (
      
      <div>
        {stepName === 'ShowGameResult' && (
          <Typography variant="h4" gutterBottom>
          {gameResult}
          </Typography>
        )}
        { (stepName === 'ReadyToChoose' || stepName === 'WaitingChooseOpponent' || stepName === 'ShowGameResult') && (
        <Grid container align = "center" justify = "center" alignItems = "center"  >
          <Grid item component="div" style={{ 
            width: '200px',
            height: '200px',
            border: '3px solid gray',
            padding: '50px',
            margin: '20px'}}>
            {`YOU:`}
            <br/>
            {personalChoice}
          </Grid>
          <Grid item component="div" style={{ 
            width: '200px',
            height: '200px',
            border: '3px solid gray',
            padding: '50px',
            margin: '20px'}}>
            {`OPPONENT:`}
            <br/>
            {opponentChoice}
          </Grid>
        </Grid>)}
        { stepName === 'ReadyToChoose' && (
        <Grid container align = "center" justify = "center" alignItems = "center"  >
          {optionsBoxes()}
        </Grid>)}
      </div>
    );
  }

  render() {
    return <div className="ui divided list">{this.renderList()}</div>;
  }
}

export default GameScreen;
