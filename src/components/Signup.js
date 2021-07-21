import React from 'react';
import '../css/Signup.css';

import { withRouter } from 'react-router-dom';

import { Form, Row, Col, Button } from 'react-bootstrap';

import url from '../serverAPI';


async function signupUser(data) {
    return fetch(url + '/signup', {
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

class Signup extends React.Component {
    constructor(props) {
        super(props);

        const { getUsername, history } = this.props;
        const username = getUsername();
        if (username) history.goBack();

        this.state = {
            name: undefined,
            email: undefined,
            password: undefined,
            gender: undefined,
            age: undefined,
            passwordMatched: true,
            popupPasswordNotMatched: false,
            popupErrorMessage: undefined
        }

        this.setName = this.setName.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.setGender = this.setGender.bind(this);
        this.setAge = this.setAge.bind(this);
        this.checkIfMatched = this.checkIfMatched.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    setName (name) {
        this.setState({ name: name });
    }
    setEmail (email) {
        this.setState({ email: email });
    }
    setPassword (password) {
        this.setState({
            popupPasswordNotMatched: false,
            password: password
        });
    }
    setGender (gender) {
        this.setState({ gender: gender });
    }
    setAge (age) {
        this.setState({ age: age });
    }

    checkIfMatched (password) {
        this.setState({ passwordMatched: this.state.password === password });
        if (this.state.passwordMatched) {
            this.setState({ popupPasswordNotMatched: false });
        }
    }
    
    async handleSubmit (e) {
        e.preventDefault();
        const { setUsername, setToken, history } = this.props;
        if (!this.state.passwordMatched) {
            this.setState({
                popupPasswordNotMatched: true
            });
            return;
        }
        const data = {
            userInfo: {
                name: this.state.name,
                email: this.state.email,
                password: this.state.password,
                gender: this.state.gender,
                age: parseInt(this.state.age)
            }
        };
        const response = await signupUser(data);
        if (response.success) {
            setToken(response.data.token);
            setUsername(response.data.username);
            history.goBack();
        } else {
            setToken(null);
            setUsername(false);
            this.setState({
                email: undefined,
                password: undefined,
                gender: undefined,
                age: undefined,
                passwordMatched: false,
                popupPasswordNotMatched: false,
                popupErrorMessage: response.error
            });
        }
    }

    render() {
        return (
            <div className="signup">
                <div className="title-font signup-title-container">Please Sign Up</div>

                {this.state.popupPasswordNotMatched ? (
                    <div className="error-font signup-error-container">Error: Password doesn't match</div>
                ) : null}

                {this.state.popupErrorMessage ? (
                    <div className="error-font signup-error-container">{"Error: " + this.state.popupErrorMessage}</div>
                ) : null}

                <div className="signup-form-container">
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

                        <Form.Group as={Row} className="mb-3" controlId="formHorizontalConfirmPassword">
                            <Form.Label className="cell-font" column sm={4}>Confirm Password</Form.Label>
                            <Col sm={8}>
                                <Form.Control className="input-font" type="password" placeholder="Please Confirm Password" minLength="8" ref={ele => this.passwordConfirmElement = ele} onChange={e => this.checkIfMatched(e.target.value)} required />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="formHorizontalUsername">
                            <Form.Label className="cell-font" column sm={4}>Username</Form.Label>
                            <Col sm={8}>
                                <Form.Control className="input-font" type="text" placeholder="Please Enter Username" onChange={e => this.setName(e.target.value)} required />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="formHorizontalAge">
                            <Form.Label className="cell-font" column sm={4}>Age</Form.Label>
                            <Col sm={8}>
                                <select className="input-font" onChange={e => this.setGender(e.target.value)} defaultValue="Please select" required>
                                    <option value="Please select" disabled>Please select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="formHorizontalAge">
                            <Form.Label className="cell-font" column sm={4}>Age</Form.Label>
                            <Col sm={8}>
                                <Form.Control className="input-font" type="number" placeholder="Please Enter Your Age" min="1" max="200" onChange={e => this.setAge(e.target.value)} required />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Col sm={{ span: 8, offset: 4 }}>
                                <div className="login-button-wrapper">
                                    <Button className="cell-font btn-block" type="submit">Sign Up</Button>
                                </div>
                            </Col>
                        </Form.Group>
                    </Form>
                </div>
                {/* <h2>Please Sign up</h2>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        <p>Account Name</p>
                        <input type="text" onChange={e => this.setName(e.target.value)} required />
                    </label>
                    <label>
                        <p>Email</p>
                        <input type="text" onChange={e => this.setEmail(e.target.value)} required />
                    </label>
                    <label>
                        <p>Password</p>
                        <input type="password" minLength="8" onChange={e => this.setPassword(e.target.value)} required />
                    </label>
                    <label>
                        <p>Confirm password</p>
                        <input type="password" ref={ele => this.passwordConfirmElement = ele} onChange={e => this.checkIfMatched(e.target.value)} required />
                        {this.state.popupPasswordNotMatched ? (
                            <p>Error: Password doesn't match.</p>
                        ) : null}
                    </label>
                    <label>
                        <p>Gender</p>
                        <select onChange={e => this.setGender(e.target.value)} defaultValue="Please select" required>
                            <option value="Please select" disabled>Please select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>
                    <label>
                        <p>Age</p>
                        <input type="number" min="1" max="200" onChange={e => this.setAge(e.target.value)} />
                    </label>
                    <div className="signup-submit-container">
                        <button className="sigup-submit" type="submit">Sign Up</button>
                    </div>
                </form> */}
            </div>
        );
    }

    componentDidMount() {
        this.passwordConfirmElement.addEventListener('focusout', (e) => {
            this.setState({
                passwordMatched: this.state.password === e.target.value,
                popupPasswordNotMatched: this.state.password !== e.target.value
            });
        });
    }
}

export default withRouter (Signup);