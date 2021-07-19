import React from 'react';
import '../../css/Users.css';

import { withRouter } from 'react-router';


class UserList extends React.Component {
    render() {
        const { users, profiles, checked, toggleCheck, history } = this.props;
        return (
            <>

            {users.reduce((acc, user, ind) => [...acc, (
                <div key={ind} className="users-row">
                    <div className="users-table-cell-0 cell-font">
                        <input className="users-table-checkbox" checked={checked[ind]} type="checkbox" onChange={() => toggleCheck(ind)} />
                    </div>
                    <div className="users-table-cell-1 cell-font">{user.uid}</div>
                    <div className="users-table-cell-2 cell-font clickable" onClick={() => history.push("/profile/" + user.uid)}>{user.name}</div>
                    <div className="users-table-cell-3 cell-font">{profiles[ind].gender}</div>
                    <div className="users-table-cell-4 cell-font">{profiles[ind].age}</div>
                    <div className="users-table-cell-5 cell-font">{profiles[ind].createtime}</div>
                </div>
            )], [])}

            </>
        );
    }
}

export default withRouter (UserList);