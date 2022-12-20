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
import { ifEmpty } from "./utils/ifEmpty";

export default class RichPresence extends Plugin {
    static classInstance: RichPresence;
    
    rpcClient = new RPCClient();
    ytmClient = new YoutubeClient();
    lfmClient!: LastFMClient;

    defaults = {
        lastfm_apikey: "615322f0047e12aedbc610d9d71f7430",
        discord_application_id: "463151177836658699",
    }

    public async init() {
        this.lfmClient?.clear();
        this.lfmClient = new LastFMClient(
            this.settings.get("lastfm_apikey", this.defaults.lastfm_apikey)
        ).setUsername(this.settings.get("lastfm_username", ""));

        await this.rpcClient.sendRPC();
    
        if (this.settings.get("rpc_enabled", false) === false) {
            return;
        }

        this.logger.info("Starting RPC...");

        if (this.settings.get("rpc_mode", "none") === "custom") {
            this.logger.info("Starting user-set RPC...");

            const startTimestamp = this.settings.get("rpc_StartTimestamp", "since_start");
            const endTimestamp = this.settings.get("rpc_EndTimestamp", "");

            await this.rpcClient.sendRPC({
                name: ifEmpty(this.settings.get("rpc_AppName", ""), "Discord"),
                type: ActivityTypes.GAME, // PLAYING
                state: this.settings.get("rpc_State", ""),
                details: this.settings.get("rpc_Details", ""),
                timestamps: {
                    start: startTimestamp === "since_start" ? (Date.now() / 1000 | 0) : Number(startTimestamp),
                    ...(endTimestamp !== "" && !isNaN(+endTimestamp) ? { end: Number(endTimestamp) } : {})
                },
                ...(this.settings.get("rpc_LargeImage", undefined) ? { assets: {
                    large_image: this.settings.get("rpc_LargeImage", undefined),
                    large_text: this.settings.get("rpc_LargeImageText", undefined),
                    small_image: this.settings.get("rpc_SmallImage", undefined),
                    small_text: this.settings.get("rpc_SmallImageText", undefined)
                }} : {}),
                buttons: [
                    { label: this.settings.get("rpc_Button1Text", ""), url: this.settings.get("rpc_Button1URL", "")},
                    { label: this.settings.get("rpc_Button2Text", ""), url: this.settings.get("rpc_Button2URL", "")}
                ].filter(x => x.label !== ""),
                application_id: ifEmpty(this.settings.get("rpc_AppID", ""), this.defaults.discord_application_id)
            });

            return;
        } 

        if (this.settings.get("rpc_mode", "none") === "lastfm") {
            this.logger.info("Streaming last.fm...");

            await this.lfmClient.stream(async (track) => {
                if (!track) {
                    await this.rpcClient.sendRPC();
                    return;
                }

                if (this.settings.get("lastfm_use_youtube", false)
                    && this.settings.get("lastfm_show_album_art", true) 
                    && !track.albumArt
                ) {
                    const matching = await this.ytmClient.findYoutubeEquivalent(track);
                    if (matching) {
                        track = this.ytmClient.applyToTrack(matching, track);
                    } else {
                        this.logger.info(`${track.artist} - ${track.name} has no album art.`)
                    }
                } else if (this.settings.get("lastfm_show_album_art", true) && !track.albumArt) {
                    track.albumArt ??= this.settings.get("lastfm_default_album_art", 
                        "https://www.last.fm/static/images/lastfm_avatar_twitter.52a5d69a85ac.png");
                }

                track.ytUrl ??= `https://music.youtube.com/search?q=${encodeURIComponent(track.artist + " " + track.name)}`

                await this.rpcClient.sendRPC(this.lfmClient.mapToRPC(track, this.settings));
            });
        }
    }

    patchListeningTo() {
        this.patcher.before(FluxDispatcher, "dispatch", (_, event) => {
            const listeningToEnabled = this.settings.get("lastfm_listening_to", false);
            const lastfmEnabled = this.settings.get("rpc_mode", "none") === "lastfm";

            if (listeningToEnabled && lastfmEnabled && event.type === "LOCAL_ACTIVITY_UPDATE" && event.type) {
                const activity = event.activity;
                if (activity && activity.type === ActivityTypes.GAME) {
                    activity.type = ActivityTypes.LISTENING;
                    event.activity = activity;
                }
            }
        })
    }

    public start() {
        RichPresence.classInstance = this;
        setLogger(this.logger);

        patchUI(this);
        this.patchListeningTo()

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
        this.rpcClient.sendRPC();
    }
}