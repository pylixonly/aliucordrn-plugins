import { Plugin } from "aliucord/entities";
import { getByProps, FluxDispatcher } from "aliucord/metro";


export default class NoIdle extends Plugin {
    public start() {
        this.patcher.before(FluxDispatcher, "dispatch", (_, event) => {
            if (event.type !== "IDLE") return;

            !!event.idleSince && this.logger.info("Cancelling idle:", event);
            if (event.idleSince) {
                delete event.idleSince;
            }
            event.idle = false;
        })
    }

    public stop() {
    }
}