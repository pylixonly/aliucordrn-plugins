import { Plugin } from "aliucord/entities";
import { Forms, getByProps, React } from "aliucord/metro";
import { Fragment } from "react";
import { patch } from "./ClonerActionSheet";
import { GrabberButtons } from "./GrabberButtons";

const { FormDivider } = Forms;
const LazyActionSheet = getByProps("openLazy", "hideActionSheet");

export default class EmoteGrabber extends Plugin {
    private static _instance;
    static get instance() { return EmoteGrabber._instance; }

    public start() {
        EmoteGrabber._instance = this;
        patch(this.patcher);

        this.patcher.before(LazyActionSheet, "openLazy", (ctx) => {
            const [component, sheet] = ctx.args;

            if (sheet !== "MessageEmojiActionSheet") return;

            component.then(instance => {
                this.patcher.after(instance, "default", (_, component: any, { emojiNode }) => {
                    if (!emojiNode.src) return;

                    const EmoteInfo = component?.props?.children?.props?.children?.props?.children;

                    if (EmoteInfo) {
                        this.patcher.after(EmoteInfo, "type", (_, component: any, { emojiNode }) => {
                            const last = component.props?.children[component.props.children.length - 1];

                            if (!last || last.key !== "emoteGrabber") {
                                component.props.children.push(<Fragment key="emoteGrabber" />);

                                const buttonView = component.props?.children[3]?.props?.children
                                if (buttonView) {
                                    buttonView.push(<GrabberButtons emojiNode={emojiNode} />)
                                    return;
                                }

                                const unjoinedButtonView = component.props?.children.findIndex(x => x?.type?.name === "Button");

                                if (unjoinedButtonView !== -1) {
                                    component.props?.children?.splice(unjoinedButtonView + 1, 0, <GrabberButtons emojiNode={emojiNode} />)
                                    return;
                                }

                                component.props?.children?.splice(-2, 0, <>
                                    <FormDivider />
                                    <GrabberButtons emojiNode={emojiNode} />
                                </>);
                            }
                        });
                    }
                });
            });
        });
    }
}