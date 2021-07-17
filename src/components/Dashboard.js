import React from 'react';
import '../css/Dashboard.css';

import AlbumList from './AlbumList';

import { withRouter } from 'react-router-dom';


async function fetchData(token) {
    return fetch('http://localhost:8080/dashboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token
        })
    })
    .then(data => data.json());
}

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            albums: undefined,
            checked: [],
            checkedCount: 0,
            checkedAll: false,
            popupNewAlbum: false,
            newAlbumTitle: ""
        };

        this.setPopupNewAlbum = this.setPopupNewAlbum.bind(this);
        this.setNewAlbumTitle = this.setNewAlbumTitle.bind(this);
        this.loadAlbums = this.loadAlbums.bind(this);
        this.toggleCheck = this.toggleCheck.bind(this);
        this.toggleCheckAll = this.toggleCheckAll.bind(this);
    }

    setPopupNewAlbum (popupNewAlbum) { 
        this.setState({ popupNewAlbum: popupNewAlbum });
    }

    setNewAlbumTitle (newAlbumTitle) {
        this.setState({ newAlbumTitle: newAlbumTitle });
    }

    async loadAlbums (token) {
        const response = await fetchData(token);
        if (response.success) {
            this.setState({
                loaded: true,
                albums: response.data,
                checked: Array(response.data.length).fill(false)
            });
        } else {
            const { handleLogout } = this.props;
            handleLogout();
            this.setState({
                loaded: true,
                albums: undefined,
                checked: []
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
        const { getToken, history } = this.props;
        const token = getToken();
        if (!token) {
            return (
                <div classname="dashboard">
                    <div className="dashboard-title-container">Dashboard</div>

                    <div className="dashboard-message-container">You haven't logged in.</div>
                </div>
            );
        }

        return (
            <div className="dashboard">
                <div className="dashboard-title-container">Dashboard</div>

                <div className="dashboard-table-container">

                    <div className="dashboard-row">
                        <button className="dashboard-button" onClick={() => this.setPopupNewAlbum(true)}>New</button>
                        <button className="dashboard-button">Delete</button>
                    </div>

                    {this.state.popupNewAlbum ? (
                        <div ref={ele => this.newAlbumWindow = ele} className="dashboard-row">
                            <div className="dashboard-newalbum-cell-1">
                                <input className="dashboard-newalbum-input"
                                    placeholder={this.state.newAlbumTitle ? this.state.newAlbumTitle : "Please enter the title..."}
                                    value={this.state.newAlbumTitle}
                                    onChange={(e) => this.setNewAlbumTitle(e.target.value)}
                                />
                            </div>
                            <button className="dashboard-newalbum-cell-2 dashboard-button dashboard-newalbum-button" onClick={() => history.push("/dashboard")}>Create</button>
                            <button className="dashboard-newalbum-cell-3 dashboard-button dashboard-newalbum-button" onClick={() => this.setPopupNewAlbum(false)}>Cancel</button>
                        </div>
                    ) : null}

                    <div className="dashboard-row">
                        <div ref={ele => this.checkAllBox = ele} className="dashboard-table-cell-0">
                            <input className="dashboard-table-checkbox" checked={this.state.checkedAll} type="checkbox" onChange={() => this.toggleCheckAll()} />
                        </div>
                        <div className="dashboard-table-cell-1">Cover</div>
                        <div className="dashboard-table-cell-2">Title</div>
                        <div className="dashboard-table-cell-3">Size</div>
                        <div className="dashboard-table-cell-4">Created At</div>
                    </div>

                    {this.state.loaded ? (
                        this.state.albums ?
                            <AlbumList albums={this.state.albums} checked={this.state.checked} toggleCheck={this.toggleCheck} />
                            :
                            <div className="dashboard-message-container">You don't have access to this page.</div>
                    ) : (
                        <div className="dashboard-message-container">Loading...</div>
                    )}
                </div>
            </div>
        );
    }

    componentDidMount() {
        const { getToken } = this.props;
        const token = getToken();
        if (token) {
            this.loadAlbums(token);
        }
    }
}

export default withRouter (Dashboard);