import React from 'react';
import '../css/Album.css';
import { withRouter } from 'react-router';


async function fetchData(aid) {
    return fetch('http://localhost:8080/album/' + aid, {
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

class Album extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            album: undefined
        };

        this.loadAlbum = this.loadAlbum.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    async loadAlbum(aid) {
        const response = await fetchData(aid);
        if (response.success) {
            this.setState({
                loaded: true,
                album: response.data.album
            });
        } else {
            console.error(response.error);
            this.setState({
                loaded: true,
                album: undefined
            });
        }
    }

    async handleDelete () {
        const { aid } = this.props.match.params;
        const { getToken, history } = this.props;
        const token = getToken();
        const data = {
            token: token,
            aidList: [aid]
        }
        const response = await postDeleteRequest(data);
        if (response.success) {
            history.goBack();
        } else {
            console.error(response.error);
            history.push({
                pathname: "/error",
                state: { detail: "You have clicked a button which is not supposed to exist" }
            });
        }
    }

    render() {
        const { aid } = this.props.match.params;
        const { getToken, history } = this.props;
        const token = getToken();

        return (
            <div className="album">
                <div className="album-horizontal">
                    <div className="title-font album-title-container clickable" onClick={() => history.push("/album/" + aid + "/content")}>{this.state.album ? this.state.album.title : "Album"}</div>
                </div>

                {this.state.loaded ? (
                    this.state.album ? (
                        <>

                        <div className="album-row album-table-container">
                            {token.uid === this.state.album.uid ?
                                <>

                                <button className="dashboard-button" onClick={() => history.push("/album/" + aid + "/edit")}>Edit</button>
                                <button className="dashboard-button" onClick={this.handleDelete}>Delete</button>

                                </>
                                : null}
                        </div>

                        <div className="album-table-container">

                            <div className="album-row">
                                <div className="album-table-cell-1">Author</div>
                                <div className="album-table-cell-2">{this.state.album.username}</div>
                            </div>
                            <div className="album-row">
                                <div className="album-table-cell-1">Created At</div>
                                <div className="album-table-cell-2">{this.state.album.createtime}</div>
                            </div>
                            <div className="album-row">
                                <div className="album-table-cell-1">Intro</div>
                                <div className="album-table-cell-2">{this.state.album.intro}</div>
                            </div>
                            <div className="album-row">
                                <div className="album-table-cell-1">Number of Contents</div>
                                <div className="album-table-cell-2">{this.state.album.size}</div>
                            </div>
                        </div>

                        </>
                    ) : (
                        <div className="album-message-container">Profile not found</div>
                    )
                ) : (
                    <div className="album-message-container">Loading...</div>
                )}
            </div>
        );
    }

    componentDidMount() {
        const { aid } = this.props.match.params;
        this.loadAlbum(aid);
    }
}

export default withRouter (Album);