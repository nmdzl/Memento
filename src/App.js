import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Navigation from './components/Navigation';
import Main from './components/Main';
import Dashboard from './components/Dashboard';
import Album from './components/Album';
import Users from './components/Users';
import Browse from './components/Browse';
import Profile from './components/Profile';
import Login from './components/Login';
import Signup from './components/Signup';


function setToken (tokenValue) {
    if (tokenValue) {
        sessionStorage.setItem('token', JSON.stringify(tokenValue));
    } else {
        sessionStorage.removeItem('token');
    }
}

function getToken () {
    const tokenString = sessionStorage.getItem('token');
    const userToken = tokenString ? JSON.parse(tokenString) : null;
    return userToken;
}

export default function App() {
    const [ isAuthed, setIsAuthed ] = useState(false);
    const handleLogout = function () {
        setToken(null);
        setIsAuthed(false);
    };
    return (
        <>
        <BrowserRouter>
            <Navigation getToken={getToken} handleLogout={handleLogout} />
            <Switch>
                <Route exact path="/"><Main /></Route>
                <Route exact path="/dashboard"><Dashboard getToken={getToken} handleLogout={handleLogout} /></Route>
                <Route exact path="/album/:aid" component={Album} />
                <Route exact path="/users"><Users getToken={getToken} /></Route>
                <Route exact path="/browse"><Browse /></Route>
                <Route exact path="/profile/:uid" component={() => <Profile getToken={getToken} />} />
                <Route exact path="/login"><Login isAuthed={isAuthed} setIsAuthed={setIsAuthed} setToken={setToken} /></Route>
                <Route exact path="/signup"><Signup isAuthed={isAuthed} setIsAuthed={setIsAuthed} setToken={setToken} /></Route>
            </Switch>
        </BrowserRouter>
        </>
    );
}