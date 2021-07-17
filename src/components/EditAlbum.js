import React from 'react';
import '../css/EditAlbum.css';

import { withRouter } from 'react-router-dom';


async function fetchData(aid) {
    return fetch('http://localhost:8080/album/' + aid, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(data => data.json());
}

async function editAlbum (data) {
    return fetch('http://localhost:8080/album', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'update',
            data: data
        })
    })
    .then(data => data.json());
}

class EditAlbum extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            title: "Loading...",
            intro: "Loading..."
        };

        this.setTitle = this.setTitle.bind(this);
        this.setIntro = this.setIntro.bind(this);
        this.loadAlbum = this.loadAlbum.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    setTitle(title) {
        this.setState({ title: title });
    }
    setIntro(intro) {
        this.setState({ intro: intro });
    }

    async loadAlbum() {
        const { aid } = this.props.match.params;
        const response = await fetchData(aid);
        if (response.success) {
            this.setState({
                loaded: true,
                title: response.data.album.title,
                intro: response.data.album.intro
            });
        } else {
            console.error(response.error);
            this.setState({
                loaded: true,
            });
        }
    }

    async handleSubmit (e) {
        e.preventDefault();
        const { getToken, history } = this.props;
        const token = getToken();
        if (!token) {
            history.goBack();
        }
        const data = {
            token: token,
            aid: this.props.match.params.aid,
            albumInfo: {
                title: this.state.title,
                intro: this.state.intro
            }
        };
        const response = await editAlbum(data);
        if (response.success) {
            history.goBack();
        } else {
            console.error(response.error);
            history.push({
                pathname: "/error",
                state: { detail: response.error }
            });
        }
    }

    render() {
        return (
            <div className="editalbum">
                <h2>Editing Album</h2>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        <p>Album Title</p>
                        <input type="text" placeholder={this.state.title} onChange={e => this.setTitle(e.target.value)} required />
                    </label>
                    <label>
                        <p>Introduction</p>
                        <input type="text" placeholder={this.state.intro} onChange={e => this.setIntro(e.target.value)} />
                    </label>
                    <div className="editalbum-submit-container">
                        <button className="editalbum-submit" type="submit">Submit</button>
                    </div>
                </form>
            </div>
        );
    }

    componentDidMount() {
        if (!this.state.loaded) {
            this.loadAlbum();
        }
    }
}

export default withRouter (EditAlbum);