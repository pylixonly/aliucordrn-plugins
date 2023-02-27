import { Plugin } from "aliucord/entities";

import { Dialog, getByProps } from "aliucord/metro";

export default class MoarConfirm extends Plugin {
    public start() {
        const CallManager = getByProps("handleStartCall");

        if (!Dialog) {
            throw new Error("window.Aliucord.metro.Dialog is null, cannot continue.");
        }

        // Patches the call action
        // @ts-ignore -- bypass private method (backup)
        this.patcher.before(CallManager, "handleStartCall", ({ args, backup }) => {
            const [{ rawRecipients: [{ username, discriminator }, multiple] }, isVideo] = args;
            const action = isVideo ? "video call" : "call";

            // if `multiple` is defined, it's probably group call
            Dialog.show({
                title: multiple ? `MoarConfirm: Start a group ${action}?` : `MoarConfirm: Start a ${action} with ${username}#${discriminator}?`,
                body: multiple ? "Are you sure you want to start the group call?" : `Are you sure you want to ${action} ${username}#${discriminator}?`,
                confirmText: "Yes",
                cancelText: "Cancel",
                confirmColor: "brand",
                onConfirm: () => {
                    try {
                        backup(...args);
                    } catch (e) {
                        this.logger.error("Failed to start call", e);
                    }
                },
            })

            // return true to prevent the original method from being called
            // patcher.instead is borked at this moment of writing
            return true;
        });
    }
}