import { Plugin } from "aliucord/entities";
import { UserStore, FluxDispatcher, getByProps, getModule } from "aliucord/metro";
import { before } from "aliucord/utils/patcher";
import LastFMClient from "./client/LastFMClient";
import YoutubeClient from "./client/YoutubeClient";
import RPCClient from "./client/RPCClient";
import { setLogger } from "./utils/Logger";
import { patchUI } from "./pages/patches";
import { useSettings } from "aliucord/api";
import { ActivityTypes } from "./types/Activity";
import { clearInterval } from "timers";
import { settings as RichPresenceSettings, defaults } from "./utils/Settings";

export default class RichPresence extends Plugin {
    static classInstance: RichPresence;
    
    rpcClient = new RPCClient();
    ytmClient = new YoutubeClient();
    lfmClient!: LastFMClient;

    public async init() {
        this.lfmClient?.clear();
        
        await this.rpcClient.clearRPC();

        if (!RichPresenceSettings.enabled) {
            return;
        }

        this.logger.info("Starting RPC...");

        switch (RichPresenceSettings.mode) {
            case "custom":
                const settings = RichPresenceSettings.custom;
                this.logger.info("Starting user-set RPC...");

                const startTimestamp = settings.get("start_timestamp");
                const endTimestamp = settings.get("end_timestamp");

                const request = await this.rpcClient.sendRPC({
                    name: settings.get("app_name"),
                    type: ActivityTypes.GAME, // PLAYING
                    state: settings.get("state"),
                    details: settings.get("details"),
                    timestamps: {
                        start: startTimestamp === "since_start" ? (Date.now() / 1000 | 0) : Number(startTimestamp),
                        ...(endTimestamp !== "" && !isNaN(+endTimestamp) ? { end: Number(endTimestamp) } : {})
                    },
                    ...(settings.get("large_image") || settings.get("small_image") ? { assets: {
                        large_image: settings.get("large_image"),
                        large_text: settings.get("large_image_text"),
                        small_image: settings.get("small_image"),
                        small_text: settings.get("small_image_text")
                    }} : {}),
                    buttons: [
                        { label: settings.get("button1_text"), url: settings.get("button1_URL")},
                        { label: settings.get("button2_text"), url: settings.get("button2_URL")}
                    ].filter(x => !!x.label),
                });
                this.logger.info("Started user-set RPC. SET_ACTIVITY: ", request);
                break;
            case "lastfm":
                this.logger.info("Streaming last.fm...");

                this.lfmClient = new LastFMClient(
                    RichPresenceSettings.lastFm.get("apiKey"),
                ).setUsername(RichPresenceSettings.lastFm.get("username"));

                await this.lfmClient.stream(async (track) => {
                    if (!track) {
                        await this.rpcClient.clearRPC();
                        return;
                    }

                    const { get } = RichPresenceSettings.lastFm;
                    if (get("youtube_fallback") && get("show_album_art") && !track.albumArt) {
                        const matching = await this.ytmClient.findYoutubeEquivalent(track);
                        if (matching) {
                            track = this.ytmClient.applyToTrack(matching, track);
                        } else {
                            this.logger.info(`${track.artist} - ${track.name} has no album art.`)
                        }
                    }

                    track.ytUrl ??= `https://music.youtube.com/search?q=${encodeURIComponent(track.artist + " " + track.name)}`

                    const request = await this.rpcClient.sendRPC(this.lfmClient.mapToRPC(track));
                    this.logger.log("Updated last.fm activity, SET_ACTIVITY: ", request);
                    get("show_toast") && window["aliucord"].metro.Toasts.open({ content: `Now playing ${track.name}` });
                });
                break;
            case "none":
                const err = "RPC mode is set to none while it's enabled";
                throw new Error(err);
        }
    }

    public start() {
        RichPresence.classInstance = this;
        const init = () => this.init().then(() => {
            this.logger.info("RPC started!")
        }).catch(e => {
            this.logger.error(e)
        });

        setLogger(this.logger);
        patchUI(this);
        this.rpcClient.patchTypeOverride(this.patcher);

        if (UserStore.getCurrentUser()) {
            init();
        } else {
            FluxDispatcher.subscribe("CONNECTION_OPEN", init);
        }
    }

    public stop() {
        this.lfmClient.clear();
        this.rpcClient.clearRPC();
    }
}