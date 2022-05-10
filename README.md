# rock-paper-scissors

This a blockchain based rock paper scissors game. Enjoy it.
.

## Intructions to play

1 - Download Firefox and Google Chrome. (Two browsers are needed)

2 - Install the Metamask extension in each browser and follow the next steps to configure it:

- Open and create you metamask wallet, once you are inside create a new network in the option Networks/Custom RPC and insert these values New RPC URL: `HTTP://127.0.0.1:7545` Chain Id: `1337` then change to this network.
- Open the gananche instance that is running and copy the private key of the first account.
- Go to one of the metamask extensions in one of the browsers and inside My Accounts/Import Account paste the first private key.
- Repeat the process to configure the second account, but this time with a different private key and a different browser.
- If everything went well in these steps you will have two browsers connected to the local ganache, and you will be using two different accounts that will have ethers.

3 - Open a terminal and go to the project root folder then run `truffle console`, after that type `migrate` and hit enter, this will compile and migrate the smart contracts.

4 - Open a terminal and move to the /rock-paper-scissors/client folder then run `npm run start`, this will start the server that will open the UI here <http://localhost:3000>

