import { FluxDispatcher, getByProps } from "aliucord/metro";
import { RPLogger } from "../utils/Logger";
import { Activity } from "../types/Activity";

export default class RPCClient {
    lastRPC: any;

    constructor(applicationId: string) {
        this.lastRPC = null;
    }

    public async sendRPC(activity: Activity | null) {
        if (!activity) {
            this.updateRPC(null);
            return;
        }

        if (activity.assets !== undefined) {
            const [large_image, small_image] = await this.lookupAssets(
                activity.application_id, 
                [activity.assets.large_image!, activity.assets.small_image!]
                    .filter(asset => asset !== undefined)
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

    public async updateRPC(activity?: any) {
        this.lastRPC = activity;
        await FluxDispatcher.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: activity
        });

        RPLogger.info(activity ? "Updated presence with params:" : "Stopped presence:", activity);
    }

    async lookupAssets(applicationId: string, names: string[]): Promise<string[]> {
        const assetLinks: string[] = [];
        for (const name of names) {
            let url: URL;

            try {
                url = new URL(name);
            } catch { // not a valid url, likely asset name
                assetLinks.push(name);
                continue;
            }

            if (url.hostname.includes("discordapp")) {
                assetLinks.push(`mp:${url.pathname.slice(1)}`);
            }
        }

        if (assetLinks.length === names.length) return assetLinks;

        return await this.uploadFromExternalLink(applicationId, names);
    }

    async uploadFromExternalLink(applicationId: string, assetNames: string[]): Promise<string[]> {
        return await fetch(`https://discord.com/api/v9/applications/${applicationId}/external-assets`, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "authorization": getByProps("getToken").getToken(),
                "content-type": "application/json"
            },
            body: JSON.stringify({ "urls": assetNames }) 
        })
          .then(res => res.json())
          .then(res => {
                return res.map((x: any) => `mp:${x['external_asset_path']}`);
           });
    }
}