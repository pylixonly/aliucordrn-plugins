import { Plugin } from "aliucord/entities"
// @ts-ignore
import { getByProps, FluxDispatcher, getByName } from "aliucord/metro";
import { findInReactTree } from "aliucord/utils";

export default class HideGiftButton extends Plugin {
    public start() {
        // why does it need to be async lmao
        (async () => {
            const ChatInput = getByName("ChatInput");
            console.log(ChatInput);

            this.patcher.before(ChatInput.default.prototype, "render", (x) => {
                x.thisObject.props.hideGiftButton = true;
            }) 
        })();
    }

    public stop() {
    }
}