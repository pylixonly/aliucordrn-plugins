import { FluxDispatcher, getByProps, getModule } from "aliucord/metro";
import { RPLogger } from "../utils/Logger";
import { Activity } from "../types/Activity";
import RichPresence from "..";

export default class RPCClient {
    lastRPC: any;

    constructor() {
        this.lastRPC = null;
    }

    public async sendRPC(activity?: Activity | null) {
        if (activity?.assets?.large_text === "") activity.assets.large_text = undefined;
        if (activity?.assets?.small_text === "") activity.assets.small_text = undefined;

        const { SET_ACTIVITY } = getModule(x => !!x.SET_ACTIVITY);
        const { handler } = SET_ACTIVITY;

        await handler({
            isSocketConnected: () => true,
            socket: {
                id: 110,
                application: {
                    id: RichPresence.classInstance.defaults.discord_application_id,
                    name: activity?.name ?? "Discord"
                },
                transport: "ipc"
            },
            args: {
                pid: 110,
                activity: activity ?? null
            }
        });

        // if (activity.assets !== undefined) {
        //     const [large_image, small_image] = await this.lookupAssets(
        //         activity.application_id, 
        //         [activity.assets.large_image!, activity.assets.small_image!]
        //     );

        //     activity.assets.large_image = large_image ? large_image : undefined;
        //     activity.assets.small_image = small_image ? small_image : undefined;

        //     if (activity.assets.large_text === "") activity.assets.large_text = undefined;
        //     if (activity.assets.small_text === "") activity.assets.small_text = undefined;
        // }

        // let params: any = {
        //     name: activity.name,
        //     type: activity.type,
        //     flags: 0,
        //     state: activity.state,
        //     details: activity.details,
        //     timestamps: activity.timestamps,
        //     assets: activity.assets,
        //     metadata: activity.buttons ? {
        //         button_urls: activity.buttons.map(x => x.url).filter(x => x !== "")
        //     } : undefined,
        //     buttons: activity.buttons?.map(x => x.label).filter(x => x !== ""),
        //     application_id: activity.application_id
        // }; 

        // // remove undefined values
        // Object.keys(params).forEach((k) => params[k] === undefined || params[k].length === 0 && delete params[k]);

        // // send update to Discord
        // // await this.updateRPC(params);
    }

    // private async updateRPC(activity?: any) {
    //     const wasNull = !activity && !this.lastRPC;
    //     this.lastRPC = activity;
    //     await FluxDispatcher.dispatch({
    //         type: "LOCAL_ACTIVITY_UPDATE",
    //         activity: activity
    //     });

    //     !wasNull && RPLogger.info(activity ? "Updated presence with params:" : "Stopped presence:", activity);
    // }
}