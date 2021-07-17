import React from 'react';
import '../css/Navigation.css';
import { withRouter } from 'react-router-dom';

import logo from '../images/logo.png';


class Navigation extends React.Component {
    render() {
        const { getToken, handleLogout, location, history } = this.props;
        const token = getToken();
        const focus_css = pathname => (location.pathname.toLowerCase() === pathname ? {
            "color": "rgb(206, 17, 65)"
        } : {});

        const handleClickLogout = function () {
            handleLogout();
            history.push("/");
        };
        
        return (
            <div className="navigation">
                <div id="navigation-container">
                    <div className="row">
                        <div id="navigation-logo-container">
                            <div className="logo">
                                <img id="img-logo" src={logo} alt="logo" onClick={() => history.push("/")} />
                            </div>
                        </div>

                        <div id="navigation-navbar-container">
                            <div className="row-navbar">

                                {token ? (
                                    token.role <= 1 ? (
                                        <button className="navigation-button"
                                            style={focus_css("/users")}
                                            onClick={() => history.push("/users")}
                                            >Users</button>
                                    ) : (
                                        <button className="navigation-button"
                                            style={focus_css("/dashboard")}
                                            onClick={() => history.push("/dashboard")}
                                            >Dashboard</button>
                                    )
                                ) : null}

                                {<button className="navigation-button"
                                    style={focus_css("/browse")}
                                    onClick={() => history.push("/browse")}
                                    >Browse</button>}

                                {token ? (
                                    <>
                                    <button className="navigation-button"
                                        style={focus_css("/profile")}
                                        onClick={() => history.push("/profile")}
                                        >Profile</button>
                                    <button className="navigation-button"
                                        onClick={handleClickLogout}
                                        >Logout</button>
                                    </>
                                ) : (
                                    <>
                                    <button className="navigation-button" 
                                        style={focus_css("/login")} 
                                        onClick={() => history.push("/login")}
                                        >Log In</button>
                                    <button className="navigation-button"
                                        style={focus_css("/signup")}
                                        onClick={() => history.push("/signup")}
                                        >Sign Up</button>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter (Navigation);