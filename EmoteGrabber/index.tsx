// @ts-ignore
import { Forms, getByProps, React, ReactNative, Styles, Toasts } from "aliucord/metro";
import { Fragment } from "react";
import { open, patch } from "./guildAddPatch";
import { Plugin } from "aliucord/entities";
import { getAssetId } from "aliucord/utils";

const { FormDivider } = Forms;
const Clipboard = getByProps("setString");
const LazyActionSheet = getByProps("openLazy", "hideActionSheet");
const Button = getByProps("ButtonColors", "ButtonLooks", "ButtonSizes").default as any;

const styles = Styles.createThemedStyleSheet({
    button: { marginTop: 14 }
});

export default class EmoteGrabber extends Plugin {
    private GrabberButtons({ emojiNode }: any) {
        return <>
            <Button
                text='Clone to Server' 
                style={styles.button} 
                color='brand'
                size='small'
                onPress={() => open(emojiNode)} 
            />
            <Button
                text='Copy URL to Clipboard'
                style={styles.button}
                color='brand'
                size='small'
                onPress={() => {
                    Clipboard.setString(emojiNode.src);
                    Toasts.open({ content: "Copied URL to clipboard", source: getAssetId("Check") });
                    LazyActionSheet.hideActionSheet("MessageEmojiActionSheet");
                }}
            />
        </>
    }

    public start() {
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
                                    buttonView.push(<this.GrabberButtons emojiNode={emojiNode} />)
                                    return;
                                }

                                const unjoinedButtonView = component.props?.children.findIndex(x => x?.type === Button);

                                if (unjoinedButtonView !== -1) {
                                    component.props?.children?.splice(unjoinedButtonView + 1, 0, <this.GrabberButtons emojiNode={emojiNode} />)
                                    return;
                                }

                                component.props?.children?.splice(-2, 0, <>
                                    <FormDivider />
                                    <this.GrabberButtons emojiNode={emojiNode} />
                                </>);
                            }
                        });
                    }
                });
            });
        });
    }

    public stop() {
    }
}