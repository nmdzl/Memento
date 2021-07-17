import React from 'react';
import '../css/UserList.css';

import { withRouter } from 'react-router';


class UserList extends React.Component {
    render() {
        const { users, checked, toggleCheck, history } = this.props;
        return (
            <>

            {users.reduce((acc, user, ind) => [...acc, (
                <div key={ind} className="users-row">
                    <div className="users-table-cell-0">
                        <input className="users-table-checkbox" checked={checked[ind]} type="checkbox" onChange={() => toggleCheck(ind)} />
                    </div>
                    <div className="users-table-cell-1">{user.uid}</div>
                    <div className="users-table-cell-2 users-table-cell-clickable" onClick={() => history.push("/profile/" + user.uid)}>{user.name}</div>
                    <div className="users-table-cell-3">{user.gender}</div>
                    <div className="users-table-cell-4">{user.age}</div>
                    <div className="users-table-cell-5">{user.createtime}</div>
                </div>
            )], [])}

            </>
        );
    }
}

export default withRouter (UserList);