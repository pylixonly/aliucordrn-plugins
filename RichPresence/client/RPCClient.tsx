import { FluxDispatcher, getByProps, getModule } from "aliucord/metro";
import { RPLogger } from "../utils/Logger";
import { Activity, ActivityTypes } from "../types/Activity";
import RichPresence from "..";
import { Patcher } from "aliucord/api";
import { settings as RichPresenceSettings } from "../utils/Settings";

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

            type === "LOCAL_ACTIVITY_UPDATE" && RPLogger.info("Dispatching RPC: ", activity);
        });
    }

    public sendRPC(activity: Activity) {
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
        RPLogger.info("Sending RPC", activity);
        this.sendRequest(activity);
    }

    private sendRequest(activity?: Activity) {
        handler({
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
    }

    public clearRPC(silent = false) {
        this.lastActivityType = ActivityTypes.GAME;
        this.sendRequest(undefined);

        if (!silent) {
            RPLogger.info("Cleared RPC");
        }
    }
}