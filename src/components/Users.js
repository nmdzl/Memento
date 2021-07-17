import React from 'react';
import '../css/Users.css';

import UserList from './UserList';

import { withRouter } from 'react-router';


async function fetchData(token) {
    return fetch('http://localhost:8080/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'fetch',
            token: token
        })
    })
    .then(data => data.json());
}

async function postDeleteRequest(token, uidList) {
    return fetch('http://localhost:8080/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'delete',
            token: token,
            uidList: uidList
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
        const response = await fetchData(token);
        if (response.success) {
            this.setState({
                loaded: true,
                users: response.data.users,
                checked: Array(response.data.users.length).fill(false),
                checkedCount: 0,
                checkedAll: false
            });
        } else {
            this.setState({
                loaded: true,
                users: undefined,
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
        const response = await postDeleteRequest(token, uidList);
        if (response.success) {
            this.loadUsers(token);
        } else {
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
                    <div className="users-title-container">Users List</div>

                    <div className="users-row">
                        <div className="users-message">You don't have the access right to this page.</div>
                    </div>
                </div>
            );
        }

        return (
            <div className="users">
                <div className="users-title-container">Users List</div>

                <div className="users-table-container">

                    <div className="users-row">
                        <button className="users-button" onClick={this.handleDelete}>Delete</button>
                    </div>

                    <div className="users-row">
                        <div ref={ele => this.checkAllBox = ele} className="users-table-cell-0">
                            {this.state.users && this.state.users.length > 0 ?
                                <input className="users-table-checkbox" checked={this.state.checkedAll} type="checkbox" onChange={() => this.toggleCheckAll()} />
                                : null}
                        </div>
                        <div className="users-table-cell-1">UID</div>
                        <div className="users-table-cell-2">Name</div>
                        <div className="users-table-cell-3">Gender</div>
                        <div className="users-table-cell-4">Age</div>
                        <div className="users-table-cell-5">Created At</div>
                    </div>
                    {this.state.loaded ? 
                        <UserList users={this.state.users} checked={this.state.checked} toggleCheck={this.toggleCheck} />
                        :
                        <div className="users-row">
                            <div className="users-message">Loading...</div>
                        </div>
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