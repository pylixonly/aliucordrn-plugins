import { FluxDispatcher, getByProps, getModule } from "aliucord/metro";
import { RPLogger } from "../utils/Logger";
import { Activity, ActivityTypes } from "../types/Activity";
import RichPresence from "..";
import { Patcher } from "aliucord/api";
import { settings as RichPresenceSettings } from "../utils/Settings";

const Toasts = (window as any).aliucord.metro.Toasts;
const { SET_ACTIVITY } = getModule(x => !!x.SET_ACTIVITY);
const { handler } = SET_ACTIVITY;

export default class RPCClient {
    private lastActivityType: ActivityTypes = ActivityTypes.GAME;

    public patchTypeOverride(patcher: Patcher) {
        patcher.before(FluxDispatcher, 'dispatch', (_, { type, activity }) => {
            if (type === "LOCAL_ACTIVITY_UPDATE" && !!activity) {
                activity.type = this.lastActivityType;
                this.lastActivityType = ActivityTypes.GAME;
            }
        });
    }

    public async sendRPC(activity: Activity, silent = false) {
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
        await this.sendRequest(activity, silent);
    }

    private async sendRequest(activity?: Activity, silent = false) {
        const result = await handler({
            isSocketConnected: () => true,
            socket: {
                id: 110,
                application: {
                    id: RichPresenceSettings.ApplicationId(),
                    name: activity?.name ?? "RichPresence"
                },
                transport: "ipc"
            },
            args: {
                pid: 110,
                activity: activity ?? null
            }
        });

        if (!silent) {
            RPLogger.info(`RPC ${activity ? "updated" : "cleared"}`, result);
            Toasts.open({ content: `Rich presence ${activity ? "updated" : "cleared"}`})
        }
    }

    public async clearRPC(silent = false) {
        this.lastActivityType = ActivityTypes.GAME;
        await this.sendRequest(undefined, silent);
    }
}