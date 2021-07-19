import React from 'react';
import '../css/AlbumContent.css';

import AlbumContentCard from './list/AlbumContentCard';

import { withRouter } from 'react-router';


const youtubeUrlRegex = /^(?:https?:)?(?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]{7,15})(?:[\?&][a-zA-Z0-9\_-]+=[a-zA-Z0-9\_-]+)*$/g;
const getVidFromUrl = (url) => {
    try {
        const res = url.split(youtubeUrlRegex)[1];
        if (7 <= res.length <= 15) return res;
        else return undefined;
    } catch (e) {
        return undefined;
    }
}

async function fetchVids(aid) {
    return fetch('http://localhost:8080/albumcontents/' + aid, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(data => data.json());
}

async function insertVidByAid(token, vid, aid) {
    return fetch('http://localhost:8080/albumcontents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'insert',
            data: {
                token: token,
                vid: vid,
                aid: aid
            }
        })
    })
    .then(data => data.json());
}

class AlbumContent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            title: "Loading Album Contents...",
            vids: undefined,
            newVideoUrl: "",
            popupNewVideoUrl: false,
            popupInvalidUrlMessage: false,
            coversize: "medium"
        };

        this.setNewVideoUrl = this.setNewVideoUrl.bind(this);
        this.setPopupNewVideoUrl = this.setPopupNewVideoUrl.bind(this);
        this.loadVids = this.loadVids.bind(this);
        this.addVideoUrl = this.addVideoUrl.bind(this);
    }

    setNewVideoUrl (newVideoUrl) {
        this.setState({ newVideoUrl: newVideoUrl });
    }
    setPopupNewVideoUrl (popupNewVideoUrl) {
        this.setState({ popupNewVideoUrl: popupNewVideoUrl });
    }

    async loadVids () {
        const { aid } = this.props.match.params;
        const response = await fetchVids(aid);
        if (response.success) {
            this.setState({
                loaded: true,
                title: response.data.title,
                vids: response.data.vids
            });
        } else {
            console.error(response.error);
            this.setState({
                loaded: true,
                title: response.error,
                vids: undefined
            });
        }
    }

    async addVideoUrl () {
        this.setState({ popupInvalidUrlMessage: false });
        const url = this.state.newVideoUrl;
        const vid = getVidFromUrl(url);
        if (!vid) {
            this.setState({
                popupInvalidUrlMessage: true,
                newVideoUrl: undefined
            });
            return;
        }
        const { getToken } = this.props;
        const token = getToken();
        if (!token) return;
        const { aid } = this.props.match.params;
        const response = await insertVidByAid(token, vid, aid);
        if (response.success) {
            this.loadVids();
        }
    }

    render() {
        const { aid } = this.props.match.params;
        const { history } = this.props;

        return (
            <div className="albumcontents">
                <div className="albumcontents-horizontal">
                    <div className="title-font albumcontents-title-container clickable" onClick={() => history.push("/album/" + aid)}>{this.state.title}</div>
                </div>

                <div className="albumcontents-grid-container">
                    {this.state.loaded && this.state.vids ? (
                        this.state.vids.map((vid, ind) => <AlbumContentCard key={ind} vid={vid} coversize={this.state.coversize} />)
                    ) : null}

                    {this.state.loaded && this.state.vids ? (
                        <div ref={ele => this.cardAddNewVideoUrl = ele} className={"albumcontents-card albumcontents-card-" + this.state.coversize} >
                            {this.state.popupNewVideoUrl ? (
                                <>
                                <input placeholder={this.state.newVideoUrl ? this.state.newVideoUrl : "Enter URL"} onChange={e => this.setNewVideoUrl(e.target.value)} />
                                <button className="albumcontents-card-button" onClick={this.addVideoUrl}>Add</button>
                                <button className="albumcontents-card-button" onClick={() => this.setPopupNewVideoUrl(false)}>Cancel</button>
                                </>
                            ) : (
                                <button className="albumcontents-card-button-whole" onClick={() => this.setPopupNewVideoUrl(true)}>Add</button>
                            )}
                        </div>
                    ) : null}
                </div>

                {!this.state.loaded ? (
                    <div className="albumcontents-horizontal">
                        <div className="albumcontents-message-container">Loading...</div>
                    </div>
                ) : null}
            </div>
        );
    }

    componentDidMount() {
        if (!this.state.loaded) {
            this.loadVids();
        }
    }
}

export default withRouter(AlbumContent);