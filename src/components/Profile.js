import React from 'react';
import '../css/Profile.css';

import { withRouter } from 'react-router';


async function fetchData(uid) {
    return fetch('http://localhost:8080/profile/' + uid, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(data => data.json());
}

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            profile: undefined
        };

        this.loadProfile = this.loadProfile.bind(this);
    }

    async loadProfile(uid) {
        const response = await fetchData(uid);
        if (response.success) {
            this.setState({
                loaded: true,
                profile: response.data
            });
        } else {
            this.setState({
                loaded: true,
                profile: undefined
            });
        }
    }

    render() {
        const { getToken, history } = this.props;
        const token = getToken();

        if (!token) {
            return (
                <div className="profile">
                    <div className="profile-title-container">Profile</div>

                    <div className="profile-row">
                        <div className="profile-message-container">You haven't logged in.</div>
                    </div>
                </div>
            );
        }

        return (
            <div className="profile">
                <div className="profile-title-container">Profile</div>

                {this.state.loaded ? (
                    this.state.profile ? (
                        <div className="profile-table-container">

                            <div className="profile-row">
                                <div className="profile-table-cell-1">UID</div>
                                <div className="profile-table-cell-2">{this.state.profile.uid}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-table-cell-1">Account name</div>
                                <div className="profile-table-cell-2">{this.state.profile.name}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-table-cell-1">Email</div>
                                <div className="profile-table-cell-2">{this.state.profile.email}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-table-cell-1">Gender</div>
                                <div className="profile-table-cell-2">{this.state.profile.gender}</div>
                            </div>
                            <div className="profile-row">
                                <div className="profile-table-cell-1">Age</div>
                                <div className="profile-table-cell-2">{this.state.profile.age}</div>
                            </div>

                            
                            {(token.role <= 1 && this.state.profile.uid !== token.token.uid) ? (
                                <div className="profile-row profile-row-buttons">
                                    <button className="profile-button" onClick={() => history.push("/users/delete/" + token.token.uid)}>Delete User</button>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div className="profile-message-container">You don't have access to this page.</div>
                    )
                ) : (
                    <div className="profile-message-container">Loading...</div>
                )}
            </div>
        );
    }

    componentDidMount() {
        const { getToken } = this.props;
        const token = getToken();
        if (token && !this.state.loaded) {
            const { uid } = this.props.match.params;
            this.loadProfile(uid);
        }
    }
}

export default withRouter (Profile);