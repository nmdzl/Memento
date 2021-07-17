import React from 'react';
import '../css/Dashboard.css';

import AlbumList from './AlbumList';

import { withRouter } from 'react-router-dom';


async function fetchData(uid) {
    return fetch('http://localhost:8080/dashboard/' + uid, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(data => data.json());
}

async function postDeleteRequest(data) {
    return fetch('http://localhost:8080/album', {
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

async function postNewAlbum(data) {
    return fetch('http://localhost:8080/album', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'create',
            data: data
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
            popupNewAlbum: false
        };

        this.setPopupNewAlbum = this.setPopupNewAlbum.bind(this);
        this.loadAlbums = this.loadAlbums.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCreateAlbum = this.handleCreateAlbum.bind(this);
        this.toggleCheck = this.toggleCheck.bind(this);
        this.toggleCheckAll = this.toggleCheckAll.bind(this);
    }

    setPopupNewAlbum (popupNewAlbum) { 
        this.setState({ popupNewAlbum: popupNewAlbum });
    }

    async loadAlbums (uid) {
        const response = await fetchData(uid);
        if (response.success) {
            this.setState({
                loaded: true,
                albums: response.data.albums,
                checked: Array(response.data.albums.length).fill(false)
            });
        } else {
            console.error(response.error);
            this.setState({
                loaded: true,
                albums: undefined,
                checked: []
            });
        }
    }

    async handleDelete() {
        if (!this.state.albums) return;
        var aidList = [];
        this.state.albums.forEach((album, ind) => {
            if (this.state.checked[ind]) aidList.push(album.aid);
        });
        if (aidList.length === 0) return;
        const { getToken, history } = this.props;
        const token = getToken();
        if (!token) {
            history.push({
                pathname: "/error",
                state: { detail: "You have clicked a button which is not supposed to exist" }
            });
        }
        const data = {
            token: token,
            aidList: aidList
        };
        const response = await postDeleteRequest(data);
        if (response.success) {
            const { uid } = this.props.match.params;
            this.loadAlbums(uid);
        } else {
            console.error(response.error);
            history.push({
                pathname: "/error",
                state: { detail: "You have clicked a button which is not supposed to exist" }
            });
        }
    }

    async handleCreateAlbum() {
        if (!this.newAlbumTitleInput) return;
        const { getToken } = this.props;
        const token = getToken();
        if (!token) return;
        const  { history } = this.props;
        var title = this.newAlbumTitleInput.value;
        if (!title) title = "Undefined";
        const data = {
            token: token,
            title: title
        };
        const response = await postNewAlbum(data);
        if (response.success) {
            history.push("/album/" + response.data.aid);
        } else {
            console.error(response.error);
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

        return (
            <div className="dashboard">
                <div className="dashboard-title-container">Dashboard</div>

                <div className="dashboard-table-container">

                    {token ? (
                        <>

                        <div className="dashboard-row">
                            <button className="dashboard-button" onClick={() => this.setPopupNewAlbum(true)}>New</button>
                            <button className="dashboard-button" onClick={this.handleDelete}>Delete</button>
                        </div>

                        {this.state.popupNewAlbum ? (
                            <div className="dashboard-row">
                                <div className="dashboard-newalbum-cell-1">
                                    <input className="dashboard-newalbum-input"
                                        ref={ele => this.newAlbumTitleInput = ele}
                                        placeholder="Please enter the title..."
                                    />
                                </div>
                                <button className="dashboard-newalbum-cell-2 dashboard-button dashboard-newalbum-button" onClick={() => this.handleCreateAlbum()}>Create</button>
                                <button className="dashboard-newalbum-cell-3 dashboard-button dashboard-newalbum-button" onClick={() => this.setPopupNewAlbum(false)}>Cancel</button>
                            </div>
                        ) : null}

                        </>
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
        if (!this.state.loaded) {
            const { uid } = this.props.match.params;
            this.loadAlbums(uid);
        }
    }
}

export default withRouter (Dashboard);