import React from 'react';
import '../css/Login.css';

import { withRouter } from 'react-router-dom';


async function loginUser (credentials) {
    return fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
    .then(data => data.json());
}

class Login extends React.Component {
    constructor(props) {
        super(props);

        const { isAuthed, history } = this.props;
        if (isAuthed) history.goBack();

        this.state = {
            email: undefined,
            password: undefined,
            popupAuthFailed: false
        }

        this.setEmail = this.setEmail.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    setEmail (email) {
        this.setState({ email: email });
    }
    setPassword (password) {
        this.setState({ password: password });
    }

    async handleSubmit (e) {
        const { setIsAuthed, setToken, history } = this.props;
        e.preventDefault();
        const response = await loginUser({
            email: this.state.email,
            password: this.state.password
        });
        if (response.success) {
            setToken(response.data.token);
            setIsAuthed(true);
            history.goBack();
        } else {
            setToken(null);
            setIsAuthed(false);
            this.setState({
                email: undefined,
                password: undefined,
                popupAuthFailed: true
            });
        }
    }

    render() {
        return (
            <div className="login-wrapper">
                <h2>Please Login</h2>

                {this.state.popupAuthFailed ?
                    <div className="login-message-container">Authentication failed...</div> : null}
                
                <form onSubmit={this.handleSubmit}>
                    <label>
                        <p>Email</p>
                        <input type="text" onChange={e => this.setEmail(e.target.value)} />
                    </label>
                    <label>
                        <p>Password</p>
                        <input type="password" onChange={e => this.setPassword(e.target.value)} />
                    </label>
                    <div className="login-submit">
                        <button className="login-submit" type="submit">Login</button>
                    </div>
                </form>
            </div>
        );
    }
}

export default withRouter (Login);