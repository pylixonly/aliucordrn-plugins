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
        
        this.lfmClient = new LastFMClient(
            RichPresenceSettings.LastFm.apiKey(),
        ).setUsername(RichPresenceSettings.LastFm.username());
        
        await this.rpcClient.clearRPC();

        if (!RichPresenceSettings.Enabled()) {
            return;
        }

        this.logger.info("Starting RPC...");

        switch (RichPresenceSettings.Mode()) {
            case "custom":
                const settings = RichPresenceSettings.Custom;
                this.logger.info("Starting user-set RPC...");

                const startTimestamp = settings.startTimestamp();
                const endTimestamp = settings.endTimestamp();

                const request = this.rpcClient.sendRPC({
                    name: settings.appName(),
                    type: ActivityTypes.GAME, // PLAYING
                    state: settings.state(),
                    details: settings.details(),
                    timestamps: {
                        start: startTimestamp === "since_start" ? (Date.now() / 1000 | 0) : Number(startTimestamp),
                        ...(endTimestamp !== "" && !isNaN(+endTimestamp) ? { end: Number(endTimestamp) } : {})
                    },
                    ...(settings.largeImage() && settings.smallImage() ? { assets: {
                        large_image: settings.largeImage(),
                        large_text: settings.largeImageText(),
                        small_image: settings.smallImage(),
                        small_text: settings.smallImageText()
                    }} : {}),
                    buttons: [
                        { label: settings.button1Text(), url: settings.button1URL()},
                        { label: settings.button2Text(), url: settings.button2URL()}
                    ].filter(x => !!x.label),
                });
                this.logger.info("Started user-set RPC. SET_ACTIVITY: ", request);
                break;
            case "lastfm":
                this.logger.info("Streaming last.fm...");

                await this.lfmClient.stream(async (track) => {
                    if (!track) {
                        await this.rpcClient.clearRPC();
                        return;
                    }

                    const { youtubeFallback, showAlbumArt, showToast } = RichPresenceSettings.LastFm;
                    if (youtubeFallback() && showAlbumArt() && !track.albumArt) {
                        const matching = await this.ytmClient.findYoutubeEquivalent(track);
                        if (matching) {
                            track = this.ytmClient.applyToTrack(matching, track);
                        } else {
                            this.logger.info(`${track.artist} - ${track.name} has no album art.`)
                        }
                    }

                    track.ytUrl ??= `https://music.youtube.com/search?q=${encodeURIComponent(track.artist + " " + track.name)}`

                    const request = await this.rpcClient.sendRPC(this.lfmClient.mapToRPC(track, this.settings));
                    this.logger.log("Updated last.fm activity, SET_ACTIVITY: ", request);
                    showToast() && window["aliucord"].metro.Toasts.open({ content: `Now playing ${track.name}` });
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