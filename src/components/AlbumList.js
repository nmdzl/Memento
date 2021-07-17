import React from 'react';
import '../css/AlbumList.css';

import { withRouter } from 'react-router';


class AlbumList extends React.Component {
    render() {
        const { albums, checked, toggleCheck, history } = this.props;
        return (
            <>

            {albums.reduce((acc, album, ind) => [...acc, (
                <div key={ind} className="dashboard-row">
                    <div className="dashboard-table-cell-0">
                        <input className="dashboard-table-checkbox" checked={checked[ind]} type="checkbox" onChange={() => toggleCheck(ind)} />
                    </div>
                    <div className="dashboard-table-cell-1">{album.cover}</div>
                    <div className="dashboard-table-cell-2 dashboard-table-cell-clickable" onClick={() => history.push("/album/" + album.aid)}>{album.title}</div>
                    <div className="dashboard-table-cell-3">{album.size}</div>
                    <div className="dashboard-table-cell-4">{album.createtime}</div>
                </div>
            )], [])}
            
            </>
        );
    }
}

export default withRouter (AlbumList);