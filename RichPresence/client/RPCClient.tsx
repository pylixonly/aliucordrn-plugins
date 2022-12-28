import { Patcher } from "aliucord/api";
import { FluxDispatcher, getModule } from "aliucord/metro";
import { Activity, ActivityTypes } from "../types/Activity";
import { settings as RichPresenceSettings } from "../utils/Settings";

const { SET_ACTIVITY } = getModule(x => !!x.SET_ACTIVITY);
const { handler } = SET_ACTIVITY;

export default class RPCClient {
    private lastActivityType: ActivityTypes = ActivityTypes.GAME;

    private replaceHostname(url: string) { 
        return url.replace(/^(mp:)?(https?:\/\/)?([^\/]+\.)?discordapp\.(com|net)\/(.*)$/i, 'mp:$5');
    }

    public patchFilter(patcher: Patcher) {
        patcher.before(FluxDispatcher, 'dispatch', (_, { type, activity }: { type: string, activity: Activity }) => {
            if (type === "LOCAL_ACTIVITY_UPDATE" && !!activity) {
                activity.type = this.lastActivityType;
                this.lastActivityType = ActivityTypes.GAME;

                console.log(activity);
                if (activity.assets) {
                    // Direct link to Discord's CDN are not accepted for some reason
                    if (activity.assets.large_image)
                        activity.assets.large_image = this.replaceHostname(activity.assets.large_image);
                    if (activity.assets.small_image)
                        activity.assets.small_image = this.replaceHostname(activity.assets.small_image);
                }
                console.log("POST:", activity)
            }
        });
    }

    public async sendRPC(activity: Activity): Promise<any> {
        // Remove empty properties/arrays
        Object.keys(activity).forEach((k) => activity[k] === undefined 
                                            || activity[k].length === 0
                                            && delete activity[k]);

        if (activity.assets) {
            Object.keys(activity.assets).forEach((k) => activity.assets![k] === undefined 
                                                        || activity.assets![k].length === 0
                                                        && delete activity.assets![k]);
        }

        this.lastActivityType = activity.type ?? ActivityTypes.GAME;
        return await this.sendRequest(activity);
    }

    private async sendRequest(activity?: Activity): Promise<any> {
        return await handler({
            isSocketConnected: () => true,
            socket: {
                id: 110,
                application: {
                    id: RichPresenceSettings.applicationId,
                    name: activity?.name ?? "RichPresence"
                },
                transport: "ipc"
            },
            args: {
                pid: 110,
                activity: activity ?? null
            }
        });
    }

    public async clearRPC(): Promise<any> {
        this.lastActivityType = ActivityTypes.GAME;
        return await this.sendRequest(undefined);
    }
}