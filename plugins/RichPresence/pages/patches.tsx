import { Forms, React, getByName, getByProps } from "aliucord/metro";
import { findInReactTree, getAssetId } from "aliucord/utils";
import RichPresence from "..";

export const patchUI = (plugin) => {
    const { FormRow } = Forms;

    const Navigation = aliucord.metro.Navigation ?? getByProps("push", "pushLazy", "pop");
    const UserSettingsOverviewWrapper = getByName("UserSettingsOverviewWrapper", { default: false });

    const unpatch = plugin.patcher.after(UserSettingsOverviewWrapper, "default", (_, res) => {
        const Overview = findInReactTree(res, m => m.type?.name === "UserSettingsOverview");

        plugin.patcher.after(Overview.type.prototype, "render", (res, { props }) => {
            const { children } = props;

            children.splice(4, 0, <>
                <FormRow
                    leading={<FormRow.Icon source={getAssetId("ic_link")} />}
                    label="Rich Presence"
                    trailing={FormRow.Arrow}
                    onPress={() => Navigation.push(RichPresence.classInstance.SettingsModal)}
                />
            </>)
        });

        unpatch();
    });
}