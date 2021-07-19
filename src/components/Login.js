import React from 'react';
import '../css/Login.css';

import { withRouter } from 'react-router-dom';

import { Form, Row, Col, Button } from 'react-bootstrap';


async function loginUser (data) {
    return fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: data
        })
    })
    .then(data => data.json());
}

class Login extends React.Component {
    constructor(props) {
        super(props);

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
        const { handleLogin, handleLogout, history } = this.props;
        e.preventDefault();
        const data = {
            credentials: {
                email: this.state.email,
                password: this.state.password
            }
        };
        const response = await loginUser(data);
        if (response.success) {
            handleLogin(response.data.username, response.data.token);
            history.goBack();
        } else {
            handleLogout();
            this.setState({
                email: undefined,
                password: undefined,
                popupAuthFailed: true
            });
        }
    }

    render() {
        return (
            <div className="login">
                <div className="title-font login-title-container">Please Log In</div>

                {this.state.popupAuthFailed ? (
                    <div className="error-font login-error-container">Authentication failed</div>
                ) : null}

                <div className="login-form-container">
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                            <Form.Label className="cell-font" column sm={4}>Email</Form.Label>
                            <Col sm={8}>
                                <Form.Control className="input-font" type="email" placeholder="Please Enter Email" onChange={e => this.setEmail(e.target.value)} required />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="formHorizontalPassword">
                            <Form.Label className="cell-font" column sm={4}>Password</Form.Label>
                            <Col sm={8}>
                                <Form.Control className="input-font" type="password" placeholder="Please Enter Password" minLength="8" onChange={e => this.setPassword(e.target.value)} required />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Col sm={{ span: 8, offset: 4 }}>
                                <div className="login-button-wrapper">
                                    <Button className="cell-font btn-block" type="submit">Log In</Button>
                                </div>
                            </Col>
                        </Form.Group>
                    </Form>
                </div>
            </div>
        );
    }

    componentDidMount() {
        const { getUsername, history } = this.props;
        const username = getUsername();
        console.log(username);
        if (username) history.goBack();
    }
}

export default withRouter (Login);