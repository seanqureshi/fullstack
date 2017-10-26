import React, { Component } from 'react';
import './Private.css';
import axios from 'axios'

export default class Private extends Component {
    constructor(props){
        super(props)

        this.state = {
            userData: {}
        }
        
    }
    
    componentDidMount(){
        axios.get('/auth/me')
        .then( res => {
            this.setState({
                userData: res.data
            })
        })
    }
    
    render(){
        // returns all objects in an array // 0 is falsey so able to display user id[0]
        let flag = Object.keys(this.state.userData).length;
        return(
            <div>
                {flag ?
                JSON.stringify(this.state.userData, null, 2)
                : 'GO LOG IN'}
            </div>
        )
    }
}