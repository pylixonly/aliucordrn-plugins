import { Plugin } from "aliucord/entities";
import { UserStore, FluxDispatcher } from "aliucord/metro";
import { before } from "aliucord/utils/patcher";
import LastFMClient from "./client/LastFMClient";
import YoutubeClient from "./client/YoutubeClient";
import { Activity, ActivityTypes } from "./types/Activity";
import { Logger } from "aliucord/utils/Logger";
import RPCClient from "./client/RPCClient";
import { setLogger } from "./utils/Logger";

export default class RichPresence extends Plugin {
    public init() {
        const rpcClient = new RPCClient("463151177836658699");
        const lfmClient = new LastFMClient("615322f0047e12aedbc610d9d71f7430", "slyde99");
        const ytmClient = new YoutubeClient();

        lfmClient.stream(async (track) => {
            if (!track) {
                rpcClient.updateRPC(null);
                return;
            }

            if (true && !track.albumArt) {
                const matching = await ytmClient.findYoutubeEquivalent(track);

                if (matching) {
                    track = ytmClient.applyToTrack(matching, track);
                } else {
                    this.logger.info(`${track.artist} - ${track.name} has no album art.`)
                }
            }

            track.albumArt ??= "https://www.last.fm/static/images/lastfm_avatar_twitter.52a5d69a85ac.png";

            rpcClient.sendRPC(lfmClient.mapToRPC(track));
        });
    }

    private update() {

    }

    public start() {
        setLogger(this.logger);
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