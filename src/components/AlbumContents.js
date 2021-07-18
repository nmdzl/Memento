import React from 'react';
import '../css/AlbumContents.css';

import { withRouter } from 'react-router';


const buildYoutubeVideoApi = (vid) => "https://www.googleapis.com/youtube/v3/videos?id=" + vid + "&key=AIzaSyBYNwfhjqubq1F57d8SrzeW11ByAd9FJ8k&fields=items(id,snippet(title,thumbnails),statistics)&part=snippet,statistics"

const youtubeUrlRegex = /^(?:https?:)?(?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]{7,15})(?:[\?&][a-zA-Z0-9\_-]+=[a-zA-Z0-9\_-]+)*$/g;


/* response.data ->
 * id: xxx
 * snippet: {
 *     title: xxx
 *     thumbnails: {
 *         default: {url: xxx, width: 120, height: 90}
 *         medium: {url: xxx, width: 320, height: 180}
 *         high: {url: xxx, width: 480, height: 360}
 *         standard: {url: xxx, width: 640, height: 480}
 *         maxres: {url: xxx, width: 1280, height: 720}
 *     }
 * }
 * statistics: {viewCount: xxx, likeCount: xxx, dislikeCount: xxx, favoriteCount: xxx, commentCount: xxx}
 */
async function fetchDataYoutubeVideo(url) {
    var vid;
    try {
        vid = url.split(youtubeUrlRegex)[1];
    } catch (e) {
        return {
            success: false,
            error: "Invalid URL for Youtube video [url=" + url + "]"
        };
    }
    const api = buildYoutubeVideoApi(vid);
    const response = await fetch(api, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(data => data.json());
    if (response.items.length === 0) {
        return {
            success: false,
            error: "Invalid URL for Youtube video [url=" + url + "]"
        };
    } else {
        return {
            success: true,
            data: response.items[0]
        };
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

class AlbumContents extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            vids: undefined,
            checked: [],
            checkedCount: 0,
            checkedAll: false
        };

        this.loadVids = this.loadVids.bind(this);
    }

    async loadVids () {
        const { aid } = this.props.match.params;
        const response = await fetchVids(aid);
        if (response.success) {
            console.log(response.data);
            this.setState({
                loaded: true,
                vids: response.data.vids,
                checked: Array(response.data.vids.length).fill(false),
                checkedCount: 0,
                checkedAll: false
            });
        } else {
            console.error(response.error);
            this.setState({
                loaded: true,
                vids: undefined,
                checked: [],
                checkedCount: 0,
                checkedAll: false
            });
        }
    }

    render() {
        return (
            <div className="albumcontents">
                <div className="albumcontents-title-container">{this.state.album ? this.state.album.title : "Album"}</div>
            </div>
        );
    }

    componentDidMount() {
        if (!this.state.loaded) {
            this.loadVids();
        }
    }
}

export default withRouter(AlbumContents);