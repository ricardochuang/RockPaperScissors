import React, { Component } from "react";
import RockPaperScissors from "./contracts/RockPaperScissors.json";
import getWeb3 from "./getWeb3";
import toast, { Toaster } from 'react-hot-toast';
import GameScreen from './components/GameScreen';
import "./App.css";
import 'regenerator-runtime/runtime';
import styled from 'styled-components';

const enumOptions = { ROCK: 1, PAPER: 2, SCISSORS: 3 };

class App extends Component {
  state = { 
    web3: null,
    accounts: null,
    contract: null,
    personalChoice: 'Not defined yet',
    opponentChoice: 'Not defined yet',
    playerData: '',
    opponentData: '',
    pageInstructions: 'Please click on join to start',
    stepName: 'BeforeJoin',
    gameResult: null
  };

  handleWinner = (contractEvent) => {
    const { returnValues } = contractEvent;
    const { accounts, personalChoice } = this.state;
    const loserAnnouncement = returnValues['loserAnnouncement'];
    const winnerAnnouncement = returnValues['winnerAnnouncement'];
    const winner = returnValues['winner'];
    let gameResult = ''; 
    let opponentChoice = ''; 
    if (accounts[0] === winner){
      gameResult = 'You are the winner!!';
      opponentChoice = loserAnnouncement;
    }
    if(winner === '0x0000000000000000000000000000000000000000') {
      gameResult = 'It is a draw';
      opponentChoice = personalChoice;
    } else {
      if(accounts[0] !== winner) {
        gameResult = 'You lost!';
        opponentChoice = winnerAnnouncement;
      }
    }
    this.setState({ gameResult, opponentChoice, pageInstructions: 'Showing results, click on play again', stepName: 'ShowGameResult' });
  }

  eventListener = (myContract) => {
    myContract.events.Winner({})
    .on('data', event => {
      this.handleWinner(event);
    });
  }

  setUpNetwork = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = RockPaperScissors.networks[networkId];
      const instance = new web3.eth.Contract(
        RockPaperScissors.abi,
        deployedNetwork && deployedNetwork.address,
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
      //Subscribe to winner event
      this.eventListener(instance);
    }
    catch(error){
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.error(error);
    }
  }

  componentDidMount = async () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", accounts => {
        this.setUpNetwork();
      });
    }
    this.setUpNetwork();
  };

  render() {
    const handleJoin = async () => {
      const { accounts, contract } = this.state;
      const myAccount = accounts[0];
      const getPlayersResponse = await contract.methods.getPlayers().call();
      const players = [getPlayersResponse[0],getPlayersResponse[1]];
      if (players.includes(myAccount)){
        toast('You already joined, please wait for an opponent', {
          icon: '👏',
        });
        const playerNumber = `Player ${players.indexOf(myAccount)+1}`;
        const playerData = `You -> ${playerNumber} -> Address: ${myAccount}`;
        this.setState({pageInstructions: 'Waiting for an opponent', playerData, stepName: 'WaitingJoinOpponent'});
      } else {
        try {
          const response = await contract.methods.joinGame().send({ from: myAccount });
          const { announcement } = response.events.PlayerJoined.returnValues;
          const playerNumber = announcement.substring(4,12);
          const playerData = `You -> ${playerNumber} -> Address: ${myAccount}`;
          toast.success(`Notificacion: ${announcement}`);
          this.setState({pageInstructions: 'Waiting for an opponent', playerData, stepName: 'WaitingJoinOpponent' });
        } catch (error) {
          alert(`Failed to join the game with this error: ${JSON.stringify(error)}`);
          console.error(`Failed to join the game with this error: ${JSON.stringify(error)}`);
        }
        
      }
    };

    const loadPlayers = async () => {
      const { accounts, contract } = this.state;
      const myAccount = accounts[0];
      const getPlayersResponse = await contract.methods.getPlayers().call();
      const players = [getPlayersResponse[0],getPlayersResponse[1]];
      if (!players.includes('0x0000000000000000000000000000000000000000')){
        const myPlayerNumber = players.indexOf(myAccount);
        const opponentPlayerNumber = myPlayerNumber === 0 ? 1: 0;
        const opponentData = `Opponent -> Player ${opponentPlayerNumber+1} -> Address: ${players[opponentPlayerNumber]}`;
        this.setState({ opponentData, pageInstructions: 'Choose one option', stepName: 'ReadyToChoose' });
      } else{
        toast('The opponent is not ready yet, try again later', {
          icon: '⏳',
        });
      }
    }

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    
    const header = () => {
      return (
        <div>
          <Toaster position="top-right" reverseOrder={false} />
          <h1>ROCK, PAPER, SCISSORS</h1>
          <h2>Welcome to this game</h2>
          <h3>{`Showing: ${this.state.accounts? this.state.accounts[0]: ''}`}</h3>
          <hr/>
        </div>
      );
    };

    const playersInformation = () => {
      return (
        <div>
          { this.state.playerData && (<h3>{this.state.playerData}</h3>)}
          { this.state.opponentData && (<h3>{this.state.opponentData}</h3>)}
          <hr/>
        </div>
      );
    };

    const joinStage = () => {
      const { stepName } = this.state;
      return (
        <div>
          { stepName === 'BeforeJoin' && (<input type="button" value="Join" onClick={handleJoin}/>)}
          { stepName === 'WaitingJoinOpponent' && (<input type="button" value="Load Players" onClick={loadPlayers}/>) }
        </div>
      );    
    }

    const onSubmitChoice = async (value) => {
      this.setState({ 
        pageInstructions: 'Please wait for opponent to choose', 
        stepName: 'WaitingChooseOpponent', 
        personalChoice: value 
      });
      const { accounts, contract } = this.state;
      const playerChoice = enumOptions[value.toUpperCase()];
      try {
        await contract.methods.chooseAnOption(playerChoice).send({ from: accounts[0]});
      } catch (error) {
        alert(`Failed to choose an option with this error: ${JSON.stringify(error)}`);
        console.error(`Failed to choose an option with this error: ${JSON.stringify(error)}`);
        this.setState({ pageInstructions: 'Choose one option', stepName: 'ReadyToChoose' });
      }
    }


    const showGameScreen = () => {
      const { stepName, personalChoice, opponentChoice, gameResult } = this.state;
      console.log({gameResult});
      if(gameResult === "You lost!"){
        return (
          <div>
            { <GameScreen 
            onSubmitChoice={onSubmitChoice} 
            stepName={stepName} 
            personalChoice={personalChoice} 
            opponentChoice={opponentChoice}
            gameResult={gameResult}
            />}
          <input type="button" value="Loser!!" onClick={loserPay}/>
          </div>
          
        );  
      }
      
      return (
        <div>
          { <GameScreen 
          onSubmitChoice={onSubmitChoice} 
          stepName={stepName} 
          personalChoice={personalChoice} 
          opponentChoice={opponentChoice}
          gameResult={gameResult}
          />}
        </div>
      );    
    }

    const handleReset = async () => {
      try {
        const options = {
          personalChoice: 'Not defined yet',
          opponentChoice: 'Not defined yet',
          gameResult:  null,
          pageInstructions: 'Choose one option', 
          stepName: 'ReadyToChoose'
        };
        this.setState(options);
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(`Failed to restart: ${JSON.stringify(error)}`);
        console.error(error);
      }
      
    }

    const loserPay = async () => {
      const { accounts, contract } = this.state;
      // await contract.methods.approve().send({from: accounts[1]});
      try {
        await contract.methods.loserTranse().send({from: accounts[0]});
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(`Failed to pay for winner: ${JSON.stringify(error)}`);
        console.error(error);
      }
      
    }


    const resetButton = () => {
      const { stepName } = this.state;
      return ( 
        stepName === 'ShowGameResult' &&
        (<div>
        <input type="button" value="Play again" onClick={handleReset}/>
          </div>)
        );  
    }

    return (
      <div className="App">
        <div className="all">
          {header()}
          {playersInformation()}
          <h3>{this.state.pageInstructions}</h3>
          {resetButton()}
          {joinStage()}
          {showGameScreen()}
        </div>

      </div>
    );
  }
}

export default App;
