import React from 'react';
import '../css/Users.css';

import UserList from './list/UserList';

import { withRouter } from 'react-router';

import url from '../serverAPI';


async function fetchData(data) {
    return fetch(url + '/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'read',
            data: data
        })
    })
    .then(data => data.json());
}

async function postDeleteRequest(data) {
    return fetch(url + '/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'delete',
            data: data
        })
    })
    .then(data => data.json());
}

class Users extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            users: undefined,
            profiles: undefined,
            checked: [],
            checkedCount: 0,
            checkedAll: false
        }

        this.loadUsers = this.loadUsers.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.toggleCheck = this.toggleCheck.bind(this);
        this.toggleCheckAll = this.toggleCheckAll.bind(this);
    }

    async loadUsers(token) {
        const response = await fetchData({ token: token });
        if (response.success) {
            this.setState({
                loaded: true,
                users: response.data.users,
                profiles: response.data.profiles,
                checked: Array(response.data.users.length).fill(false),
                checkedCount: 0,
                checkedAll: false
            });
        } else {
            console.error(response.error);
            this.setState({
                loaded: true,
                users: undefined,
                profiles: undefined,
                checked: [],
                checkedCount: 0,
                checkedAll: false
            });
        }
    }

    async handleDelete() {
        if (!this.state.users) return;
        var uidList = [];
        this.state.users.forEach((user, ind) => {
            if (this.state.checked[ind]) uidList.push(user.uid);
        });
        if (uidList.length === 0) return;
        const { getToken, history } = this.props;
        const token = getToken();
        if (!token) return;
        const data = {
            token: token,
            uidList: uidList
        };
        const response = await postDeleteRequest(data);
        if (response.success) {
            this.loadUsers(token);
        } else {
            console.error(response.error);
            history.push({
                pathname: "/error",
                state: { detail: "You have clicked a button which is not supposed to exist" }
            });
        }
    }

    toggleCheck (ind) {
        const newArray = this.state.checked.reduce((acc, cur, i) => [...acc, ind === i ? !cur : cur], []);
        const newCount = newArray[ind] ? this.state.checkedCount + 1 : this.state.checkedCount - 1;
        this.setState({
            checked: newArray,
            checkedCount: newCount,
            checkedAll: newCount === newArray.length
        });
    }

    toggleCheckAll () {
        if (this.checkAllBox.checked) {
            this.checkAllBox.checked = false;
            const newArray = Array(this.state.checked.length).fill(false);
            this.setState({
                checkedAll: false,
                checkedCount: 0,
                checked: newArray
            });
        } else {
            this.checkAllBox.checked = true;
            const newArray = Array(this.state.checked.length).fill(true);
            this.setState({
                checkedAll: true,
                checkedCount: newArray.length,
                checked: newArray
            });
        }
    }

    render() {
        const { getToken } = this.props;
        const token = getToken();

        if (!token || !token.role || token.role > 1) {
            return (
                <div className="users">
                    <div className="title-font users-title-container">Users List</div>

                    <div className="error-font users-error-container">You don't have the access right to this page.</div>
                </div>
            );
        }

        return (
            <div className="users">
                <div className="title-font users-title-container">Users List</div>

                <div className="users-table-container">

                    <div className="users-row">
                        <button className="users-button users-button-anchor-right" onClick={this.handleDelete}>Delete</button>
                    </div>

                    <div className="users-row">
                        <div ref={ele => this.checkAllBox = ele} className="users-table-cell-0 cell-font">
                            {this.state.users && this.state.users.length > 0 ?
                                <input className="users-table-checkbox" checked={this.state.checkedAll} type="checkbox" onChange={() => this.toggleCheckAll()} />
                                : null}
                        </div>
                        <div className="users-table-cell-1 cell-font">UID</div>
                        <div className="users-table-cell-2 cell-font">Name</div>
                        <div className="users-table-cell-3 cell-font">Gender</div>
                        <div className="users-table-cell-4 cell-font">Age</div>
                        <div className="users-table-cell-5 cell-font">Created At</div>
                    </div>
                    {this.state.loaded ? 
                        <UserList users={this.state.users} profiles={this.state.profiles} checked={this.state.checked} toggleCheck={this.toggleCheck} />
                        :
                        <div className="message-font users-message-container">Loading...</div>
                    }
                </div>
            </div>
        );
    }

    componentDidMount() {
        const { getToken } = this.props;
        const token = getToken();
        if (token && token.role && token.role <= 1) {
            this.loadUsers(token);
        }
    }
}

export default withRouter (Users);