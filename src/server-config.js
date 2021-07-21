// heroku server configuration
const serverPort = process.env.PORT || 80;
const serverUrl = "https://localhost:" + serverPort;


export {
    serverPort,
    serverUrl
}