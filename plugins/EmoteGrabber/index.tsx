import { Plugin } from "aliucord/entities";
import { getModule, React } from "aliucord/metro";
import { findInReactTree } from "aliucord/utils";
import { GrabberButtons } from "./GrabberButtons";

const MessageEmojiActionSheetModule = getModule(x => x.GuildDetails && typeof x.default === "function");

export default class EmoteGrabber extends Plugin {
    start() {
        this.patcher.after(MessageEmojiActionSheetModule, "default", (_, component: any, { emojiNode }) => {
            if (!emojiNode.src) return;

            const emojiDetails = findInReactTree(component, x => x?.props?.emojiNode);
            if (!emojiDetails) return;

            const unpatch = this.patcher.after(emojiDetails, "type", (_, component: any, { emojiNode }) => {
                React.useEffect(() => unpatch, []);

                const buttonView = component.props?.children?.[3]?.props?.children;
                if (buttonView) {
                    buttonView.push(<GrabberButtons emojiNode={emojiNode} />);
                    return;
                }

                const unjoinedButtonViewIndex = component.props?.children.findIndex(
                    x => x?.type?.name === "Button"
                );

                component.props?.children?.splice?.(
                    -~unjoinedButtonViewIndex || -2,
                    0,
                    <GrabberButtons emojiNode={emojiNode} />
                );
            });
        });
    }
}
