import { Plugin } from "aliucord/entities";
import { getByProps, FluxDispatcher, Forms, React, ReactNative } from "aliucord/metro";
import { getAssetId } from "aliucord/utils";
import { patchUI, open } from "./husk";

const { ScrollView } = ReactNative;
const { FormRow, FormDivider } = Forms;
const LazyActionSheet = getByProps("openLazy", "hideActionSheet");

export default class EmoteGrabber extends Plugin {
    ServersList() {
        // @ts-ignore
        return <ScrollView>
        </ScrollView>
    }

    public start() {
        patchUI(this.patcher, this.ServersList);

        this.patcher.before(LazyActionSheet, "openLazy", (ctx) => {
            const [component, sheet] = ctx.args;

            if (sheet === "MessageEmojiActionSheet") {
                component.then(instance => {
                    this.patcher.after(instance, "default", (_, component: any, { emojiNode }) => {
                        if (!emojiNode.src) return;

                        const EmoteInfo = component?.props?.children?.props?.children?.props?.children;

                        if (EmoteInfo) {
                            this.patcher.after(EmoteInfo, "type", (_, component: any, { emojiNode }) => {
                                const buttonView = component.props?.children[3]?.props?.children
                                if (buttonView) {
                                    const Button = buttonView[1].type;
                                    buttonView.splice(2, 0, 
                                        <Button text='deez nuts' color='green' size='small' style={{marginTop:16}} />
                                    )
                                } else {
                                    const Button = getByProps("ButtonColors", "ButtonLooks", "ButtonSizes");
                                    component.props.children.push(<>
                                        // @ts-ignore
                                        <Button text='deez nuts' color='green' size='small' style={{marginTop:16}} />
                                    </>)
                                }
                                const last = component.props?.children[component.props.children.length - 1];
                                console.log()
                                if (!last || last.key !== "emoteGrabber") {
                                    this.logger.info("Adding button");
                                    // open(emojiNode);
                                }
                            });
                        }
                    });
                });
            }
        });
    }

    public stop() {
    }
}