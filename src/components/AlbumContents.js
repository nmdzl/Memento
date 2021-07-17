import React from 'react';
import '../css/AlbumContents.css';

export default class AlbumContents extends React.Component {
    render() {
        return (
            <div className="albumcontents">
                <div className="albumcontents-title-container">{this.state.album ? this.state.album.title : "Album"}</div>
            </div>
        );
    }
}