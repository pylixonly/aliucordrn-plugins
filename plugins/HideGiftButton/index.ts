import { Plugin } from "aliucord/entities";
import { getByName } from "aliucord/metro";

export default class HideGiftButton extends Plugin {
    public start() {
        // why does it need to be async lmao
        (async () => {
            const ChatInput = getByName("ChatInput");

            this.patcher.before(ChatInput.default.prototype, "render", (x) => {
                x.thisObject.props.hideGiftButton = true;
            });
        })();
    }
}
