// TODO: TypeScript-ify this a bit 

import { Plugin } from "aliucord/entities";
import { UserStore, FluxDispatcher/*, "Toasts"*/ } from "aliucord/metro"; // can't import Toasts guhh
import { before } from "aliucord/utils/patcher";
import AssetManager from "./AssetManager";

interface Activity {
    name: string;
    type: Number;
    flags: Number;
    application_id: string;
    state?: string;
    details?: string;
    timestamps?: {
        start?: Number;
        end?: Number;
    },
    metadata?: {
        button_urls?: Array<string>;
    },
    assets?: {
        large_image?: string;
        large_text?: string;
        small_image?: string;
        small_text?: string;
    },
    buttons?: Array<string>;
}

let Toasts;

export default class RichPresence extends Plugin {
    public init() {
        // couldn't import Toasts smh
        Toasts = (window as any).aliucord.metro.Toasts;

        const assetManager = new AssetManager({
            applicationId: "463151177836658699",
            logger: this.logger, 
            options: {}
        });

        this.initRPC(assetManager);
    }

    public async initRPC(assetManager: AssetManager) {
        const [imageLink] = await assetManager.parseImageLinks("https://i.pinimg.com/originals/da/18/f9/da18f92b2a0fbf88cf64a30304c9c1a6.gif");

        Toasts.open({ content: "Initializing RPC..." });
        
        await this.sendRPCRequest({
            name: "with your soul",
            type: 0, // PLAYING
            flags: 0,
            state: "L + Ratio",
            details: "<- random image--testing something",
            timestamps: {
                start: Date.now() / 1000 | 0 // 'OR 0' rounds to integer
            },
            assets: {
                large_image: imageLink, // "mp:emojis/942391865817301003.gif?quality=lossless",
                large_text: "CocoaXD"
            },
            metadata: {
                button_urls: [
                    "https://music.youtube.com/watch?v=n-LCCiSErCo&feature=share",
                    "https://discord.com/vanityurl/dotcom/steakpants/flour/flower/index11.html"
                ]
            },
            buttons: [
                "random link #1",
                "random link #2"
            ],
            application_id: "463151177836658699"
        });
    }

    public async sendRPCRequest(activity: Activity) {
        FluxDispatcher.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: activity
        });

        this.logger.info("Dispatched with activity:", activity);
    }

    public async stopRPC() {
        FluxDispatcher.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: null
        });

        this.logger.info("Stopped RPC");
    }
    
    public async stop() {
        this.stopRPC();
    }

    public async start() {
        let initialized = false;

        if (UserStore.getCurrentUser()) {
            this.init();
            return;
        }

        before(FluxDispatcher, 'dispatch', (_, event) => {
            if (!initialized && event.type === "CONNECTION_OPEN") {
                this.init();
                initialized = true;
            }
        });
    }
}