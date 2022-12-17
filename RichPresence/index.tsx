import { Plugin } from "aliucord/entities";
import { UserStore, FluxDispatcher/*, "Toasts"*/ } from "aliucord/metro"; // can't import Toasts guhh
import { before } from "aliucord/utils/patcher";
import AssetManager from "./AssetManager";
import LastFMClient, { ActivityTypes } from "./LastFMClient";
import YoutubeClient from "./YoutubeClient";

export interface Activity {
    name: string;
    type: ActivityTypes;
    application_id: string;
    state?: string;
    details: string;
    timestamps?: {
        start?: Number;
        end?: Number;
    },
    assets?: {
        large_image?: string;
        large_text?: string;
        small_image?: string;
        small_text?: string;
    },
    buttons?: Array<{
        label: string;
        url: string;
    }>;
}

export default class RichPresence extends Plugin {

    private lastRPC = null;

    public init() {
        // const Toasts = (window as any).aliucord.metro.Toasts;
        // this.startExampleRPC();
        this.initLastFm();
    }

    public async sendRPC(activity: Activity, assetManager: AssetManager) {
        if (activity.assets !== undefined) {
            const [large_image, small_image] = await assetManager.parseAssetsNames(
                [activity.assets.large_image!, activity.assets.small_image!]
            );

            large_image && (activity.assets.large_image = large_image);
            small_image && (activity.assets.small_image = small_image);
        }

        let params: any = {
            name: activity.name,
            type: activity.type,
            flags: 0,
            state: activity.state,
            details: activity.details,
            timestamps: activity.timestamps,
            assets: activity.assets,
            metadata: activity.buttons ? {
                button_urls: activity.buttons.map(button => button.url)
            } : undefined,
            buttons: activity.buttons?.map(button => button.label),
            application_id: activity.application_id
        }; 

        // remove undefined values
        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

        // send update to Discord
        this.updateRPC(params);
    }

    private async updateRPC(activity?: any) {
        this.lastRPC = activity;
        await FluxDispatcher.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: activity
        });

        this.logger.info(activity ? "Updated presence with params:" : "Stopped presence:", activity);
    }

    public async initLastFm() {
        const Toasts = (window as any).aliucord.metro.Toasts;
        Toasts.open({ content: "Initializing..."});

        const client = new LastFMClient("615322f0047e12aedbc610d9d71f7430", "slyde99", this.logger);
        await client.stream(async (track) => {
            if (!track) {
                this.updateRPC(null);
                return;
            }

            this.logger.info(track.duration)

            if (true && !track.albumArt) {
                const ytClient = new YoutubeClient(this.logger);
                const matching = await ytClient.findYoutubeEquivalent(track);

                if (matching) {
                    track = ytClient.applyToTrack(matching, track);
                } else {
                    this.logger.info(`${track.artist} - ${track.name} has no album art.`)
                }
            }

            track.albumArt ??= "https://www.last.fm/static/images/lastfm_avatar_twitter.52a5d69a85ac.png";

            this.sendRPC(client.mapToRPC(track) as any, new AssetManager({
                applicationId: "463151177836658699",
                logger: this.logger,
                options: {}
            }));
        })
    }

    public startExampleRPC() {
        this.sendRPC({
            name: "with your soul",
            type: ActivityTypes.GAME, // PLAYING
            state: "L + Ratio",
            details: "<- random image--testing something",
            timestamps: {
                start: Date.now() / 1000 | 0 // 'OR 0' rounds to integer
            },
            assets: {
                large_image: "https://i.pinimg.com/originals/da/18/f9/da18f92b2a0fbf88cf64a30304c9c1a6.gif",
                large_text: "CocoaXD"
            },
            buttons: [
                { label: "random link #1", url: "https://music.youtube.com/watch?v=n-LCCiSErCo&feature=share"},
                { label: "random link #2", url: "https://discord.com/vanityurl/dotcom/steakpants/flour/flower/index11.html"}
            ],
            application_id: "463151177836658699"
        }, new AssetManager({
            applicationId: "463151177836658699",
            logger: this.logger, 
            options: {}
        }));
    }

    private async initializeWebSocket() {
        const ws = new WebSocket("ws://192.168.0.198:26206");
        
        ws.addEventListener('open', () => {
            this.logger.info(`[OPEN] Connected to websocket: ${ws.url}`);   
            ws.send("[READY] Websocket is ready to receive messages"); 
        });

        ws.addEventListener('message', (event) => {
            this.logger.info(`[MESSAGE] Data received from websocket: ${event.data}`);
            
            const response = JSON.parse(event.data);
            switch (response.type) {
                case "UPDATE": {
                    this.sendRPC(response.activity, new AssetManager({ 
                        applicationId: response.activity.application_id, 
                        logger: this.logger, 
                        options: response.assetOptions 
                    }));
                    break;
                }
                case "STOP": {
                    this.updateRPC(null);
                    break;
                }
            }
        });

        ws.addEventListener('close', (event) => {
            if (event.wasClean) {
                this.logger.info(`[CLOSE] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                this.logger.warn(`[CLOSE] Connection died`);
            }

            // this.updateRPC(null);
        });
        
        ws.addEventListener("error", e => {
            this.logger.error(`[ERROR] ${(e as ErrorEvent).message}`)}
        );
    }

    public async start() {
        let initialized = false;
        // this.initializeWebSocket();
        
        if (UserStore.getCurrentUser()) {
            this.init();
            initialized = true;
        }

        before(FluxDispatcher, 'dispatch', (_, event) => {
            if (!initialized && event.type === "CONNECTION_OPEN") {
                this.init();
                initialized = true;
            } else if (event.type === "PRESENCE_UPDATE") {
                this.updateRPC(this.lastRPC);
            }
        });
    }

    public async stop() {
        this.updateRPC(null);
    }
}