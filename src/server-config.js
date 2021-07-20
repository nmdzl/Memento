// heroku server configuration
const serverPort = process.env.PORT || 80;
const serverUrl = "https://toy-memento.herokuapp.com:" + serverPort;


export {
    serverPort,
    serverUrl
}