import { Plugin } from "aliucord/entities";
import { FluxDispatcher } from "aliucord/metro";

export default class NoIdle extends Plugin {
    public start() {
        this.patcher.before(FluxDispatcher, "dispatch", (_, event) => {
            if (event.type !== "IDLE") return;

            if (event.idleSince) {
                delete event.idleSince;
            }

            event.idle = false;
        });
    }
}
