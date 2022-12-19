import { Plugin } from "aliucord/entities";
import { UserStore, FluxDispatcher, getByProps } from "aliucord/metro";
import { before } from "aliucord/utils/patcher";
import LastFMClient from "./client/LastFMClient";
import YoutubeClient from "./client/YoutubeClient";
import RPCClient from "./client/RPCClient";
import { setLogger } from "./utils/Logger";
import { patchUI } from "./pages/patches";

export default class RichPresence extends Plugin {
    rpcClient = new RPCClient();
    lfmClient = new LastFMClient("615322f0047e12aedbc610d9d71f7430").setUsername("slyde99");
    ytmClient = new YoutubeClient();

    public async init() {
        await this.lfmClient.stream(async (track) => {
            if (!track) {
                this.rpcClient.updateRPC(null);
                return;
            }

            if (true && !track.albumArt) {
                const matching = await this.ytmClient.findYoutubeEquivalent(track);

                if (matching) {
                    track = this.ytmClient.applyToTrack(matching, track);
                } else {
                    this.logger.info(`${track.artist} - ${track.name} has no album art.`)
                }
            }

            track.albumArt ??= "https://www.last.fm/static/images/lastfm_avatar_twitter.52a5d69a85ac.png";

            this.rpcClient.sendRPC(this.lfmClient.mapToRPC(track));
        });
    }

    private update() {

    }

    public start() {
        setLogger(this.logger);
        patchUI(this);


        let initialized = false;

        if (UserStore.getCurrentUser()) {
            this.init();
            initialized = true;
        }

        before(FluxDispatcher, 'dispatch', (_, event) => {
            if (!initialized && event.type === "CONNECTION_OPEN") {
                this.init();
                initialized = true;
            } else if (event.type === "PRESENCE_UPDATE") {
                this.update();
            }
        });
    }

    public stop() {
    }
}