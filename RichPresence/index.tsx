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

    public init() {
        this.lfmClient?.clear();
        
        this.lfmClient = new LastFMClient(
            RichPresenceSettings.LastFm.apiKey(),
        ).setUsername(RichPresenceSettings.LastFm.username());
        
        this.rpcClient.clearRPC();

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

                this.rpcClient.sendRPC({
                    name: settings.appName(),
                    type: ActivityTypes.GAME, // PLAYING
                    state: settings.state(),
                    details: settings.details(),
                    timestamps: {
                        start: startTimestamp === "since_start" ? (Date.now() / 1000 | 0) : Number(startTimestamp),
                        ...(endTimestamp !== "" && !isNaN(+endTimestamp) ? { end: Number(endTimestamp) } : {})
                    },
                    ...(settings.largeImage() ? { assets: {
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
                break;
            case "lastfm":
                this.logger.info("Streaming last.fm...");

                this.lfmClient.stream(async (track) => {
                    if (!track) {
                        this.rpcClient.clearRPC();
                        return;
                    }

                    const { youtubeFallback, showAlbumArt } = RichPresenceSettings.LastFm;
                    if (youtubeFallback() && showAlbumArt() && !track.albumArt) {
                        const matching = await this.ytmClient.findYoutubeEquivalent(track);
                        if (matching) {
                            track = this.ytmClient.applyToTrack(matching, track);
                        } else {
                            this.logger.info(`${track.artist} - ${track.name} has no album art.`)
                        }
                    }

                    track.ytUrl ??= `https://music.youtube.com/search?q=${encodeURIComponent(track.artist + " " + track.name)}`

                    const mapped = this.lfmClient.mapToRPC(track, this.settings);
                    if (!!mapped) this.rpcClient.sendRPC(mapped);
                    else this.rpcClient.clearRPC(/*silent:*/ true);
                });
                break;
            case "none":
                const err = "RPC mode is set to none while it's enabled";
                this.logger.error(err);
                throw new Error(err);
        }
    }

    public start() {
        RichPresence.classInstance = this;

        setLogger(this.logger);
        patchUI(this);
        this.rpcClient.patchTypeOverride(this.patcher);

        if (UserStore.getCurrentUser()) {
            this.init();
        } else {
            this.patcher.before(FluxDispatcher, 'dispatch', (_, event) => {
                if (event.type === "CONNECTION_OPEN") {
                    this.init();
                }
            });
        }
    }

    public stop() {
        this.lfmClient.clear();
        this.rpcClient.clearRPC();
    }
}