import React from 'react';
import './App.css';
import _ from 'lodash'
import { ChatBody } from './components/chat/ChatBody'


class App extends React.Component {
  constructor() {
    super();
    this.state = {


    };
  }
  componentDidMount() {
    console.log(this.props, 'ssssssssssssss')
    // this.props.itemDetails()
    // this.props.buttonClick(this.props.data.isClick)
  }



  render() {

    return (
      <div className="main">
        <ChatBody data={this.props} />
      </div>
    );
  }

}


export default App
