const discordRPC = require("discord-rpc");
const axios = require("axios").default;

const APP_VERSION = require("./package.json").version;

const clientId = "790499924021346355";

var currentStreamId = -1;
const rpc = new discordRPC.Client({transport: "ipc"});
let dnbradioHTTP = axios.create({
    headers: {
        "User-Agent": `dnbradio-rpc/${APP_VERSION}`
    },
    timeout: 10e3
});

function updateCurrentStream() {
    dnbradioHTTP.get("https://api.dnbradio.nl/now_playing").then((res) => {
        let currentStream = res.data;
        if (currentStream.id != currentStreamId) {
            currentStreamId = currentStream.id;
            rpc.setActivity({
                details: "Listening to",
                state: `${currentStream.artist} - ${currentStream.title}`,
                largeImageKey: "dnbradio",
                largeImageText: "dnbradio.com"
            });
        }
    }).catch((err) => {
        console.log(`An error occurred while getting data from DnBRadio: ${err}`);
    });
}

rpc.on("ready", () => {
    console.log(`Logged in as ${rpc.user.username}`);
    console.log("DnBRadio RPC is running. Press ^C to stop");
    updateCurrentStream();
    // Refresh every 15 seconds as DnBRadio HTML Player does
    setInterval(updateCurrentStream, 15e3);
});

rpc.login({clientId});
