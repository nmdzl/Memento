import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Navigation from './components/Navigation';
import Main from './components/Main';
import Dashboard from './components/Dashboard';
import Album from './components/Album';
import EditAlbum from './components/EditAlbum';
import AlbumContent from './components/AlbumContent';
import Users from './components/Users';
import Explore from './components/Explore';
import Profile from './components/Profile';
import Login from './components/Login';
import Signup from './components/Signup';
import Error from './components/Error';


function setToken (token) {
    if (token) {
        sessionStorage.setItem('token', JSON.stringify(token));
    } else {
        sessionStorage.removeItem('token');
    }
}

function getToken () {
    const tokenString = sessionStorage.getItem('token');
    const userToken = tokenString ? JSON.parse(tokenString) : null;
    return userToken;
}

function setUsername (username) {
    if (username) {
        sessionStorage.setItem('username', username);
    } else {
        sessionStorage.removeItem('username');
    }
}

function getUsername () {
    return sessionStorage.getItem('username');
}

export default function App() {
    const handleLogout = function () {
        setUsername(undefined);
        setToken(null);
    };
    const handleLogin = function (username, token) {
        setUsername(username);
        setToken(token);
    };
    return (
        <>
        <BrowserRouter>
            <Navigation getUsername={getUsername} getToken={getToken} handleLogout={handleLogout} />
            <Switch>
                <Route exact path="/"><Main /></Route>
                <Route exact path="/dashboard/:uid" component={() => <Dashboard getToken={getToken} />} />
                <Route exact path="/album/:aid" component={() => <Album getToken={getToken} />} />
                <Route exact path="/album/:aid/edit" component={() => <EditAlbum getToken={getToken} />} />
                <Route exact path="/album/:aid/content" component={() => <AlbumContent getToken={getToken} />} />
                <Route exact path="/users"><Users getToken={getToken} /></Route>
                <Route exact path="/explore"><Explore /></Route>
                <Route exact path="/profile/:uid" component={() => <Profile getToken={getToken} />} />
                <Route exact path="/login"><Login getUsername={getUsername} handleLogin={handleLogin} handleLogout={handleLogout} /></Route>
                <Route exact path="/signup"><Signup getUsername={getUsername} setUsername={setUsername} setToken={setToken} /></Route>
                <Route exact path="/error"><Error /></Route>
            </Switch>
        </BrowserRouter>
        </>
    );
}