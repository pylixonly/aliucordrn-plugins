import { Patcher } from "aliucord/api";
import { getByProps } from "aliucord/metro";

const GroupDMs = getByProps("invite");

export const open = (arg) => GroupDMs.invite({ isPrivate: () => true, id: { isServerPicker: true, arg } }).onPress();

export const patchUI = (patcher: Patcher, loadComponent) => {
    patcher.before(getByProps("openLazy", "hideActionSheet"), "openLazy", (ctx) => {
        const [component, sheet] = ctx.args;
        
        if (sheet !== "PrivateChannelRecipientsInvitePopout") return;

        const [_, __, { channelId }] = ctx.args;
        if (!channelId?.isServerPicker) return;

        component.then(instance => {
            patcher.after(instance, "default", (_, component: any, what) => {
                if (!what.channelId || !what.channelId.isServerPicker) return;

                component.props.children = loadComponent;

                patcher.after(component.props.header, "type", (_, component: any, what) => {
                    component.props.children = [component.props.children[0]]
                    component.props.children[0].props.title = "Emote Grabber";
                });
            })
        });
    });
}