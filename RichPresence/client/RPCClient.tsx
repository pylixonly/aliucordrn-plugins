import { FluxDispatcher, getByProps, getModule } from "aliucord/metro";
import { RPLogger } from "../utils/Logger";
import { Activity, ActivityTypes } from "../types/Activity";
import RichPresence from "..";
import { Patcher } from "aliucord/api";

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

    public sendRPC(activity: Activity) {
        // Remove empty properties/arrays
        Object.keys(activity).forEach((k) => activity[k] === undefined 
                                            || activity[k].length === 0
                                            && delete activity[k]);

        if (!!activity.assets) {
            Object.keys(activity.assets).forEach((k) => activity.assets![k] === undefined 
                                                        || activity.assets![k].length === 0
                                                        && delete activity.assets![k]);
        }

        this.lastActivityType = activity.type ?? ActivityTypes.GAME;
        this.sendRequest(activity);
    }

    private sendRequest(activity?: Activity) {
        handler({
            isSocketConnected: () => true,
            socket: {
                id: 110,
                application: {
                    id: RichPresence.classInstance.defaults.discord_application_id,
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

    public clearRPC() {
        this.lastActivityType = ActivityTypes.GAME;
        this.sendRequest(undefined);
    }
}