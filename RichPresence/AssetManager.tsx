import { Logger } from "aliucord/utils/Logger";
import { getByProps } from "aliucord/metro";

type AssetOptions = {
};

export default class AssetManager {
    applicationId: string;
    logger: Logger;
    options: AssetOptions;
    
    constructor({ applicationId, logger, options }: { applicationId: string, logger: Logger, options: AssetOptions }) {
        this.applicationId = applicationId;
        this.logger = logger;
        this.options = options;
    }

    async parseAssetsNames(links: string[]): Promise<string[]> {
        return await Promise.all(links.map(x => this.parseAssetName(x)));
    }

    async parseAssetName(link: string): Promise<string> {
        let url: URL;

        try {
            url = new URL(link);
        } catch { // not a valid url, likely asset name
            return link;
        }

        if (!["http:", "https:"].includes(url.protocol)) {
            this.logger.warn("Protocol must be either http or https.");
            return link;
        }

        if (url.hostname.includes("discordapp")) {
            return `mp:${url.pathname.slice(1)}`;
        }

        return await this.uploadFromExternalLink(link).then(x => x[0]);
    }

    // :sus:
    // probably not a good idea to use this (security reasons), *but it works*
    async uploadFromExternalLink(...link: string[]): Promise<string[]> {
        return await fetch(`https://discord.com/api/v9/applications/${this.applicationId}/external-assets`, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "en-US",
                "authorization": getByProps("getToken").getToken(),
                "content-type": "application/json"
            },
            body: JSON.stringify({ "urls": link }) 
        })
          .then(res => res.json())
          .then(res => {
                return res.map((x: any) => `mp:${x['external_asset_path']}`);
           });
    }
        

    /*
        DEPRECATED: External images are now uploaded correctly through the application now, kept for future reference.

        - Kinda hacky but.. *works*.
        - Using webhook, post a message with the wanted image as avatar and get the webhook id and avatar id
        - then use the webhook id and avatar hash to form a working png link. I tried to use the upload files param before
        - but it didn't work. Skill issue.
        - The size is pretty small, but enough for RPC, I guess. Animated gifs are NOT supported.
    */
    // async uploadExternalImagesFromWebhook(link: string, webhookUrl: string) {
    //     const params = {
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             avatar_url: link,
    //             content: `<${link}>`
    //         }),
    //         method: "POST"
    //     };
        
    //     let response = await fetch(`${webhookUrl}?wait=true`, params).then(res => res.json());

    //     let messsageId = response.webhook_id;
    //     let avatarHash = response.author.avatar;

    //     if (!avatarHash) { // might do a while loop here until xx retries
    //         this.logger.warn("Avatar hash is null, likely still unloaded, attempting to fetch it again..");
    //         response = await fetch(`${webhookUrl}/messages/${response.id}`).then(res => res.json());
            
    //         avatarHash = response.author.avatar;
    //     }

    //     return `mp:avatars/${messsageId}/${avatarHash}.png`;
    // }
}