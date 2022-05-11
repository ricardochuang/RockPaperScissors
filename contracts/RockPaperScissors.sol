// SPDX-License-Identifier: MIT
import "../openzeppelin/contracts/token/ERC20/ERC20.sol";
pragma solidity ^0.8.0;

contract RockPaperScissors is ERC20 {


    constructor() public ERC20("Game Coin", "GCOIN") {
        //Minting 1000 fungible tokens in the smart contract
        _mint(address(this), 1000);
    }

    // Using enum to have a fixed set of options
    enum Options {NOT_PLAYED, ROCK, PAPER, SCISSORS}

    // Used to show data about the finished game, it shows the choice of winner-loser and the address of the winner
    event Winner(
        string loserAnnouncement,
        string winnerAnnouncement,
        address winner
    );

    event Winner2(
        address WINNER
    );

    // Used to show when the players join the game
    event PlayerJoined(string announcement, address player);
    address private player1;
    address private player2;
    uint256 bet1;
    uint256 bet2;
    address private WINNER;
    // address payable[] recipients;
    address public owner;

    address private LOSER;
    Options player1Choice = Options.NOT_PLAYED;
    Options player2Choice = Options.NOT_PLAYED;

    // It is needed to have at least to players to start the game
    modifier atLeastTwoPlayers() {
        require(
            player1 != address(0),
            "Please join the game before you choose an option"
        );
        require(
            player2 != address(0),
            "Can not choose an option before the player 2 joins the game"
        );
        _;
    }
    // Prevents players from changing their option during the game
    modifier alreadyPlayed() {
        if (msg.sender == player1 && player1Choice != Options.NOT_PLAYED) {
            revert("You already played");
        }
        if (msg.sender == player2 && player2Choice != Options.NOT_PLAYED) {
            revert("You already played");
        }
        _;
    }

    // Prevents players from joinning multiple times
    modifier alreadyJoined() {
        require(
            msg.sender != player1,
            "This address already joined as player 1"
        );
        require(
            msg.sender != player2,
            "This address already joined as player 2"
        );
        _;
    }

    // Function to allow the players to join the game, players will be assigned starting by player 1,
    // if it was assigned before then it assigns it to player2.
    function joinGame()payable external alreadyJoined() {
        // Prevents more than two players per game
        require(
            player1 == address(0) || player2 == address(0),
            "There is no space for new players"
        );
        // If the player1 has not been assigned before then assign the sender address to player1
        if (player1 == address(0)) {
            player1 = msg.sender;
            bet1 = msg.value;
            emit PlayerJoined("The player 1 joined the game", player1);
        } else {
            // If the player2 has not been assigned before then assign the sender address to player2
            if (player2 == address(0)) {
                player2 = msg.sender;
                bet2 = msg.value;
                emit PlayerJoined("The player 2 joined the game", player2);
            }
        }
    }

    // function send_call(address payable a) public {
    //     bytes memory payload = abi.encodeWithSignature("set_sender()");
    //     (bool success, bytes memory returnData) = a.call{value: 0.1 ether}(payload);            
    //     require(success);
    // }

   function loserTranse() payable external {
       emit Winner2(WINNER);
        // payable(WINNER).transfer(msg.value);
        // this.transfer(WINNER, msg.value*10e18);
   
    //    transferFrom(LOSER, WINNER, msg.value);
    //    transferFrom(LOSER, WINNER, 10000000);

        // transfer(msg.sender, msg.value);
        send_ETH(payable (WINNER));
        // send_call(payable (WINNER));
        // transferFrom(msg.sender, address(this), msg.value);

   }

    function send_ETH(address payable recipient) payable public {

        fund(recipient);
    }
   
    function fund(address payable recipient) payable public {
        //transfer ETH from this smart contract to the recipient
        recipient.transfer(msg.value*10e18);
    }


    // Using external since it is cheaper than public and nobody needs to call it internally
    // Function to select the players option and the game, and if both players are selected an option then choose a winner
    function chooseAnOption(Options _playerChoice)
    external
    atLeastTwoPlayers()
    alreadyPlayed()
    {
        // Disables this NOT_PLAYED option from the game
        require(
            _playerChoice != Options.NOT_PLAYED,
            "The choice NOT PLAYED is not valid"
        );
        if (msg.sender == player1) {
            player1Choice = _playerChoice;
        }
        if (msg.sender == player2) {
            player2Choice = _playerChoice;
        }
        if (
            player1Choice != Options.NOT_PLAYED &&
            player2Choice != Options.NOT_PLAYED
        ) {
            selectWinner();
        }
    }

    // The rock defeats the scissors by breaking it, the scissors that defeats the paper by cutting it
    // and the paper defeats the stone by wrapping it, if the option is the same then it is a draw
    function selectWinner() internal{
        Options winnerChoice;
        Options loserChoice;
        address winner;
        address loser;
        // It is a draw
        if (player1Choice == player2Choice) {
            winnerChoice = player1Choice;
            loserChoice = winnerChoice;
            winner = address(0);
        }
        // The winner is player1
        else if (
            (player1Choice == Options.ROCK &&
            player2Choice == Options.SCISSORS) ||
            (player1Choice == Options.SCISSORS &&
            player2Choice == Options.PAPER) ||
            (player1Choice == Options.PAPER && player2Choice == Options.ROCK)
        ) {
            winnerChoice = player1Choice;
            loserChoice = player2Choice;
            winner = player1;
            loser = player2;
            WINNER = player1;
            LOSER = player2;
        }
        // The winner is player2
        else {
            winnerChoice = player2Choice;
            loserChoice = player1Choice;
            winner = player2;
            loser = player1;
            WINNER = player2;
            LOSER = player1;
        }
        // Announce the loser and winner
        string memory loserAnnouncement =
        getAnnouncement(loserChoice, "The loser chose: ");
        string memory winnerAnnouncement =
        getAnnouncement(winnerChoice, "The winner chose: ");
        emit Winner(loserAnnouncement, winnerAnnouncement, winner);
//        loserTranse(winner);
        // After the winner was announced, the game is reset
        reset();
    }

    fallback() external payable {}
    receive() external payable {}

    // Creates an announcement message for the players
    function getAnnouncement(Options option, string memory message)
    internal
    pure
    returns (string memory announcement)
    {
        string memory choice = getMyOptionKeyByValue(option);
        return string(abi.encodePacked(message, choice));
    }

    // Convert the enum to string
    function getMyOptionKeyByValue(Options option)
    internal
    pure
    returns (string memory selectedOption)
    {
        if (Options.ROCK == option) return "Rock";
        if (Options.SCISSORS == option) return "Scissors";
        if (Options.PAPER == option) return "Paper";
        if (Options.NOT_PLAYED == option) return "Not played";
    }

    function reset() internal {
        player1Choice = Options.NOT_PLAYED;
        player2Choice = Options.NOT_PLAYED;
    }
    

    // Using getter instead of public addresses because address modification is not allowed
    function getPlayers() external view returns (address, address) {
        return (player1, player2);
    }
}