import { Plugin } from "aliucord/entities";
import { FluxDispatcher, UserStore } from "aliucord/metro";
import { patchUI } from "./pages/patches";
import { ActivityTypes } from "./types/Activity";
import { setLogger } from "./utils/Logger";
import { settings as RichPresenceSettings } from "./utils/Settings";

import LastFMClient from "./client/LastFMClient";
import RPCClient from "./client/RPCClient";
import YoutubeClient from "./client/YoutubeClient";

export default class RichPresence extends Plugin {
    static classInstance: RichPresence;
    
    rpcClient = new RPCClient();
    ytmClient = new YoutubeClient();
    lfmClient?: LastFMClient;

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

                const largeImage = settings.get("large_image");
                const smallImage = settings.get("small_image");

                const startTimestamp = settings.get("start_timestamp", -1);
                const endTimestamp = settings.get("end_timestamp");

                const request = await this.rpcClient.sendRPC({
                    name: settings.get("app_name", "Discord"),
                    type: ActivityTypes.GAME, // PLAYING
                    state: settings.get("state"),
                    details: settings.get("details"),
                    ...(settings.get("enable_timestamps") ? { timestamps: {
                        start: Number(startTimestamp) === -1 ? (Date.now() / 1000 | 0) : Number(startTimestamp),
                        ...(!!endTimestamp && !isNaN(+endTimestamp) ? { end: Number(endTimestamp) } : {})
                    }} : {}),
                    ...(largeImage || smallImage ? { assets: {
                        large_image: largeImage,
                        large_text: !!largeImage ? settings.get("large_image_text") : undefined,
                        small_image: settings.get("small_image"),
                        small_text: !!largeImage ? settings.get("small_image_text") : undefined
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
                    if (!track || !this.lfmClient) {
                        await this.rpcClient.clearRPC();
                        return;
                    }

                    const { get } = RichPresenceSettings.lastFm;
                    if (get("youtube_fallback") && (get("show_album_art") ?? true) && !track.albumArt) {
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
                    (get("show_toast") ?? true) && window["aliucord"].metro.Toasts.open({ content: `Now playing: ${track.name}` });
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
        this.lfmClient?.clear();
        this.rpcClient.clearRPC();
    }
}
