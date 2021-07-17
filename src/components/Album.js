import React from 'react';
import '../css/Album.css';


async function fetchData(aid) {
    return fetch('http://localhost:8080/album/' + aid, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(data => data.json());
}

export default class Album extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            album: undefined
        };

        this.loadAlbum = this.loadAlbum.bind(this);
    }

    async loadAlbum(aid) {
        const album = await fetchData(aid);
        this.setState({
            loaded: true,
            album: album
        });
    }

    render() {
        return (
            <div className="album">
                <div className="album-title-container">{this.state.loaded ? this.state.album.title : `Loading Album...`}</div>

                {this.state.loaded ? (
                    <>

                    <div className="album-cover-container">
                        <img alt={"cover for album " + this.state.album.title} />
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
                ) : null}
            </div>
        );
    }

    componentDidMount() {
        const { aid } = this.props.match.params;
        this.loadAlbum(aid);
    }
}