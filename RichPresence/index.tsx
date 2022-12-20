import { Plugin } from "aliucord/entities";
import { UserStore, FluxDispatcher, getByProps } from "aliucord/metro";
import { before } from "aliucord/utils/patcher";
import LastFMClient from "./client/LastFMClient";
import YoutubeClient from "./client/YoutubeClient";
import RPCClient from "./client/RPCClient";
import { setLogger } from "./utils/Logger";
import { patchUI } from "./pages/patches";
import { useSettings } from "aliucord/api";
import { ActivityTypes } from "./types/Activity";
import { clearInterval } from "timers";

export default class RichPresence extends Plugin {
    static classInstance: RichPresence;
    
    rpcClient = new RPCClient();
    lfmClient = new LastFMClient("615322f0047e12aedbc610d9d71f7430").setUsername("slyde99");
    ytmClient = new YoutubeClient();

    public async init() {
        this.lfmClient.clear();
        await this.rpcClient.sendRPC();

        if (this.settings.get("rpc_enabled", false)) {
            this.logger.info("Rich Presence is enabled.");
            await this.rpcClient.sendRPC({
                name: this.settings.get("rpc_AppName", "Discord"),
                type: ActivityTypes.GAME, // PLAYING
                state: this.settings.get("rpc_State", ""),
                details: this.settings.get("rpc_Details", ""),
                timestamps: {
                    start: Date.now() / 1000 | 0 // 'OR 0' rounds to integer
                },
                assets: {
                    large_image: this.settings.get("rpc_LargeImage", undefined),
                    large_text: this.settings.get("rpc_LargeImageText", undefined),
                    small_image: this.settings.get("rpc_SmallImage", undefined),
                    small_text: this.settings.get("rpc_SmallImageText", undefined)
                },
                buttons: [
                    { label: this.settings.get("rpc_Button1Text", ""), url: this.settings.get("rpc_Button1URL", "")},
                    { label: this.settings.get("rpc_Button2Text", ""), url: this.settings.get("rpc_Button2URL", "")}
                ],
                application_id: this.settings.get("rpc_AppID", "463151177836658699")
            });

            return;
        } 

        this.logger.info("Streaming last.fm...");

        await this.lfmClient.stream(async (track) => {
            if (!track) {
                await this.rpcClient.sendRPC();
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

            await this.rpcClient.sendRPC(this.lfmClient.mapToRPC(track));
        });
    }

    private update() {

    }

    public start() {
        RichPresence.classInstance = this;
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