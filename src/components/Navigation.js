import React from 'react';
import '../css/Navigation.css';
import { withRouter } from 'react-router-dom';

import { Nav, Navbar, NavDropdown, Container } from 'react-bootstrap';


class Navigation extends React.Component {
    render() {
        const { getUsername, getToken, handleLogout, history } = this.props;
        const username = getUsername();
        const token = getToken();

        const handleClickLogout = function () {
            handleLogout();
            history.push("/");
        };
        
        return (
            <Navbar className="navigation" bg="transparent" variant="dark">
                <Container>
                <Navbar.Brand className="nav-font" onClick={() => history.push("/")}>Memento.io</Navbar.Brand>
                <Nav className="me-auto">
                    <Navbar.Collapse id="basic-navbar-nav">
                        {username ? (
                            <Nav className="me-auto">
                                <NavDropdown className="nav-font" title={"Welcome, " + username + "!"} id="basic-nav-dropdown">
                                <NavDropdown.Item className="nav-font" onClick={() => history.push("/profile/" + token.uid)}>Profile</NavDropdown.Item>
                                <NavDropdown.Item className="nav-font" onClick={handleClickLogout}>Log out</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        ) : (
                            <Nav className="me-auto">
                                <NavDropdown className="nav-font" title={"Welcome, Guest!"} id="basic-nav-dropdown">
                                <NavDropdown.Item className="nav-font" onClick={() => history.push("/login")}>Log in</NavDropdown.Item>
                                <NavDropdown.Item className="nav-font" onClick={() => history.push("/signup")}>Sign up</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        )}
                    </Navbar.Collapse>
                    {username ? (
                        token.role > 1 ? (
                            <Nav.Link className="nav-font" onClick={() => history.push("/dashboard/" + token.uid)}>Dashboard</Nav.Link>
                        ) : (
                            <Nav.Link className="nav-font" onClick={() => history.push("/users")}>Users</Nav.Link>
                        )
                    ) : null}
                    <Nav.Link className="nav-font" onClick={() => history.push("/explore")}>Explore</Nav.Link>
                </Nav>
                </Container>
            </Navbar>
        );
    }
}

export default withRouter (Navigation);