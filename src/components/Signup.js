import React from 'react';
import '../css/Signup.css';

import { withRouter } from 'react-router-dom';


async function signupUser (info) {
    console.log(info);
    return fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            info: info
        })
    })
    .then(data => data.json());
}

class Signup extends React.Component {
    constructor(props) {
        super(props);

        const { isAuthed, history } = this.props;
        if (isAuthed) history.goBack();

        this.state = {
            email: undefined,
            password: undefined,
            gender: undefined,
            age: undefined,
            passwordMatched: false,
            popupPasswordNotMatched: false
        }

        this.setEmail = this.setEmail.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.setGender = this.setGender.bind(this);
        this.setAge = this.setAge.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    setEmail (email) {
        this.setState({ email: email });
    }

    setPassword (password) {
        this.setState({ password: password });
    }

    setGender (gender) {
        this.setState({ gender: gender });
    }

    setAge (age) {
        this.setState({ age: age });
    }
    
    async handleSubmit (e) {
        const { setIsAuthed, setToken, history } = this.props;
        e.preventDefault();
        if (!this.state.passwordMatched) {
            this.setState({
                popupPasswordNotMatched: true
            });
            return;
        }
        const response = await signupUser({
            email: this.state.email,
            password: this.state.password,
            gender: this.state.gender,
            age: this.state.age
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
                gender: undefined,
                age: undefined,
                passwordMatched: false,
                popupPasswordNotMatched: false
            });
        }
    }

    render() {
        return (
            <div className="signup">
                <h2>Please Sign up</h2>
                <form onSubmit={this.handleSubmit}>
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
                        <input ref={ele => this.passwordConfirmElement = ele} type="password" />
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
                        <input type="number" min="1" max="200"onChange={e => this.setAge(e.target.value)} />
                    </label>
                    <div className="signup-submit">
                        <button className="sigup-submit" type="submit">Sign Up</button>
                    </div>
                </form>
            </div>
        );
    }

    componentDidMount() {
        this.passwordConfirmElement.addEventListener('focusout', (e) => {
            this.setState({
                passwordMatched: this.state.password === e.target.value
            });
            if (this.state.popupPasswordNotMatched && this.state.passwordMatched) {
                this.setState({
                    popupPasswordNotMatched: false
                });
            } else if (!this.state.popupPasswordNotMatched && !this.state.passwordMatched) {
                this.setState({
                    popupPasswordNotMatched: true
                });
            }
        });
    }
}

export default withRouter (Signup);