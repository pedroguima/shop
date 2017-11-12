import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Web3 from 'web3';

if (typeof web3 !== 'undefined') {
  window.web3Object = new Web3(Web3.givenProvider);
} else {
  console.log('No web3? You should consider trying MetaMask!')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3Object = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

window.web3Object.eth.net.getId().then(netId => {
    if(netId !== 4) {
      alert("Please change to Rinkeby test network");
    }
});


  var contract_abi = [{"constant":false,"inputs":[{"name":"_description","type":"string"},{"name":"_price","type":"uint256"},{"name":"_stock","type":"uint256"}],"name":"addProduct","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_quantity","type":"uint256"}],"name":"buyProduct","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"numProducts","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"getProduct","outputs":[{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getShopBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]
  //var contract_address = "0x510412bba39437487ec142c63c3245843afb8609";
  var contract_address = "0x70c800c2b4540b4a0460d4be87a32c904768f9df";
  window.myContract = new window.web3Object.eth.Contract(contract_abi, contract_address);

const transactionStates = { 
  IDLE: "",
  CONFIRMING: "CONFIRMING",
  CONFIRMED: "CONFIRMED",
  ERROR: "ERROR"
}

class Item extends React.Component {

  constructor() {
    super()
    this.state = {
      sendingState: transactionStates.IDLE 
    }
  }

  buyItem(id, price, quantity, defaultAccount) {
    return () => {
      this.setState({ sendingState: transactionStates.CONFIRMING})
      window.myContract.methods.buyProduct(id, 1).send({from: defaultAccount, value: price*quantity})
      .then( () => this.setState({sendingState: transactionStates.CONFIRMED}));
    }
  }
  
  render() {
    const { name, stock, price, id, defaultAccount } = this.props;
    const { sendingState } = this.state;
    let price_in_ether = window.web3Object.utils.fromWei(price, 'ether')

    return(
        <li>
        <h3>
          {name}
          <button style={{float: "right"}} onClick={ this.buyItem(id, price, 1, defaultAccount)} disabled={sendingState === transactionStates.CONFIRMING}>
            Buy
          </button>
        </h3>
        <p>
          <b>stock:</b> {stock} | <b>price (ether):</b> {price_in_ether}
        </p>
        <p>{sendingState}</p>
        </li>
        );
  }
}

class ShoppingList extends React.Component {

  constructor() {
    super()
    this.state = {
      products: []
    }
  }

  componentWillMount() {
    window.web3Object.eth.getAccounts().then((res) => { this.setState ( { defaultAccount: res[0] })})
    
    let loadProducts = []

    for(let i=0; i<this.props.numProducts; i++) {
      loadProducts.push(window.myContract.methods.getProduct(i).call())
    }
    
    return Promise.all(loadProducts).then(products => {this.setState({products})});

  }

  render() {
    return (
        <div className="shopping-list">
        <h1>Shopping List </h1>
        <ul style={{display: "inline-block"}}>
          {
            this.state.products.map((item, index) => <Item defaultAccount={this.state.defaultAccount} key={index} id={index} name={item[0]} price={item[1]} stock={item[2]} />)
          }
        </ul>
        </div>
        );
  }
}

class Shop extends React.Component {
  constructor() {
    super();
    this.state = {
      numProducts: null,
      balance: null
    };
  }
    componentWillMount() {
      window.myContract.methods.numProducts().call().then((res) => {  this.setState( { numProducts : res })});
      window.myContract.methods.getShopBalance().call().then((res) => {  this.setState( { balance : res })});
    }

  renderNumProducts() {
    let balance_in_ether

    if(this.state.balance) {
      balance_in_ether = window.web3Object.utils.fromWei(this.state.balance, 'ether')
    }else {
      balance_in_ether = "Loading..."
    }

    return ( 
        <div>
          <p><b>Total available products:</b> {this.state.numProducts}</p>
          <p><b>Shop balance: (ether)</b> {balance_in_ether}</p>
          <hr/>
        </div>
        );

  }

  render() {
    return this.state.numProducts ? 
        <div>
          {this.renderNumProducts()}
          <ShoppingList numProducts={this.state.numProducts}/>
        </div> : 
         <div>Loading products</div> 
        ;
  }
}

// ========================================



ReactDOM.render(
    <Shop/>,
    document.getElementById('root')
  );

