import React, { Component } from 'react';
import './Login.css';
import logo from './communityBank.svg'

export default class Login extends Component {
    render() {
        return (
            <div className="login">
                <img src={logo} alt='Community Bank Logo'/>
                <a href={process.env.REACT_APP_LOGIN}>
                    <button type='' className=''>Login</button>
                </a>
            </div>
        )
    }
}
