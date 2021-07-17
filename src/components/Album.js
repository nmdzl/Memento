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

class Album extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            album: undefined
        };

        this.loadAlbum = this.loadAlbum.bind(this);
    }

    async loadAlbum(aid) {
        const response = await fetchData(aid);
        if (response.success) {
            this.setState({
                loaded: true,
                album: response.data
            });
        } else {
            this.setState({
                loaded: true,
                album: undefined
            });
        }
    }

    render() {
        const { aid } = this.props.match.params;
        const { getToken, history } = this.props;
        const token = getToken();

        return (
            <div className="album">
                <div className="album-title-container">{this.state.album ? this.state.album.title : "Album"}</div>

                {this.state.loaded ? (
                    this.state.album ? (
                        <>

                        <div className="dashboard-row album-table-container">
                            <button className="dashboard-button" onClick={() => history.push("/album/" + aid + "/full")}>View full list</button>
                            {token.uid === this.state.album.uid ?
                                <button className="dashboard-button" onClick={() => history.push("/album/delete/" + aid)}>Delete</button>
                                : null}
                        </div>

                        <div className="album-cover-container">
                            <img alt={"cover for album"} />
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