
import './chatBody.css';
import ChatList from '../chat/ChatList'
import ChatContent from '../chat/ChatContent'



import React from 'react';
function ChatBody(props) {
    return (
        <div className="main__chatbody">

            <ChatList />
            <ChatContent data={props.data} />
        </div>
    );
}

export { ChatBody };