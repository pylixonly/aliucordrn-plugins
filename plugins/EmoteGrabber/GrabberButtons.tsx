// @ts-ignore
import { getByProps, React, Styles, Toasts } from "aliucord/metro";
import { getAssetId } from "aliucord/utils";
import { openClonerActionSheet } from "./ClonerActionSheet";

const Button = getByProps("ButtonColors", "ButtonLooks", "ButtonSizes").default as any;
const Clipboard = getByProps("setString");
const LazyActionSheet = getByProps("openLazy", "hideActionSheet");

const styles = Styles.createThemedStyleSheet({
    button: { marginTop: 12 }
});

export const GrabberButtons = ({ emojiNode }: any) => {
    return <>
        <Button
            text='Clone to another server' 
            style={styles.button} 
            color='brand'
            size='small'
            onPress={() => openClonerActionSheet(emojiNode)} 
        />
        <Button
            text='Copy URL to clipboard'
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