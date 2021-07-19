import React from 'react';
import '../../css/Dashboard.css';

import { withRouter } from 'react-router';


class AlbumList extends React.Component {
    render() {
        const { albums, checked, toggleCheck, history } = this.props;
        return (
            <>

            {albums.map((album, ind) => (
                <div key={ind} className="dashboard-row">
                    <div className="dashboard-table-cell-1 cell-font">
                        <input className="dashboard-table-checkbox" checked={checked[ind]} type="checkbox" onChange={() => toggleCheck(ind)} />
                    </div>
                    <div className="dashboard-table-cell-2 cell-font clickable" onClick={() => history.push("/album/" + album.aid)}>{album.title}</div>
                    <div className="dashboard-table-cell-3 cell-font">{album.size}</div>
                    <div className="dashboard-table-cell-4 cell-font">{album.createtime}</div>
                </div>
            ))}
            
            </>
        );
    }
}

export default withRouter (AlbumList);