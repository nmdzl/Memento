import React from 'react';
import '../../css/AlbumContent.css';

import { withRouter } from 'react-router';


const buildYoutubeVideoApi = (vid) => "https://www.googleapis.com/youtube/v3/videos?id=" + vid + "&key=AIzaSyBYNwfhjqubq1F57d8SrzeW11ByAd9FJ8k&fields=items(snippet(title,thumbnails),statistics)&part=snippet,statistics";

/* response.data ->
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
async function fetchDataYoutubeVideo(vid) {
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
            error: "Invalid vid for Youtube video [vid=" + vid + "]"
        };
    } else {
        return {
            success: true,
            data: response.items[0]
        };
    }
}

class AlbumContentCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            vidInfo: undefined
        }

        this.loadVidInfo = this.loadVidInfo.bind(this);
    }

    async loadVidInfo() {
        const { vid } = this.props;
        const response = await fetchDataYoutubeVideo(vid);
        if (response.success) {
            this.setState({
                loaded: true,
                vidInfo: response.data
            });
        } else {
            this.setState({
                loaded: true,
                vidInfo: undefined
            });
        }
    }

    render() {
        const { coversize, vid } = this.props;

        return (
            <div className={"albumcontents-card albumcontents-card-" + coversize + " clickable"} onClick={() => window.location = "https://www.youtube.com/watch?v=" + vid} >
                <img src={this.state.loaded && this.state.vidInfo?.snippet?.thumbnails ? this.state.vidInfo.snippet.thumbnails[coversize].url : "/images/error_album-content.png"} alt="" />
                <p className="albumcontents-card-title">{this.state.loaded && this.state.vidInfo ? this.state.vidInfo.snippet.title : "Loading..."}</p>
            </div>
        );
    }

    componentDidMount() {
        if (!this.state.loaded) {
            this.loadVidInfo();
        }
    }
}

export default withRouter(AlbumContentCard);