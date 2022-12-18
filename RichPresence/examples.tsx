import RPCClient from "./client/RPCClient";
import { ActivityTypes } from "./types/Activity";

export function startExampleRPC(rpcClient: RPCClient) {
    rpcClient.sendRPC({
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
    });
}