import React from 'react';
import '../css/EditAlbum.css';

import { withRouter } from 'react-router-dom';

import { Form, Row, Col, Button } from 'react-bootstrap';

import { serverUrl } from '../server-config';


async function fetchData(aid) {
    return fetch(serverUrl + '/album/' + aid, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(data => data.json());
}

async function editAlbum (data) {
    return fetch(serverUrl + '/album', {
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
        const { aid } = this.props.match.params;
        const { history } = this.props;

        return (
            <div className="editalbum">
                <div className="title-font editabulm-title-container">Editing Album</div>

                <div className="editalbum-form-container">
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Group className="mb-3" controlId="formHorizontalTitle">
                            <Form.Label className="cell-font">Enter New Title</Form.Label>
                            <Form.Control className="input-font" type="text" placeholder={this.state.title} onChange={e => this.setTitle(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formHorizonalIntro">
                            <Form.Label className="cell-font">Enter New Intro</Form.Label>
                            <Form.Control className="input-font" as="textarea" rows={3} placeholder={this.state.intro} onChange={e => this.setIntro(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <div className="editalbum-row">
                                <div className="editalbum-button-wrapper">
                                    <Button className="cell-font btn-block" type="submit">Submit</Button>
                                </div>
                                <div className="editalbum-button-wrapper editalbum-button-anchor-right">
                                    <Button className="cell-font btn-block btn-danger" onClick={() => history.push("/album/" + aid)}>Cancel</Button>
                                </div>
                            </div>
                        </Form.Group>
                    </Form>
                </div>
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