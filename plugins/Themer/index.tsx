import { Plugin } from "aliucord/entities";
import { getByProps, React } from "aliucord/metro";
import PageSave from "./ui/components/PageSave";
import MainPage from "./ui/MainPage";
import ColorPickerPage from "./ui/pages/ColorPickerPage";
import RawColorsPage from "./ui/pages/RawColorsPage";
import SemanticColorsPage from "./ui/pages/SemanticColorsPage";
import { reloadColor } from "./utils";

export default class Themer extends Plugin {
    start() {
        // findByDisplayName("HSVColorPicker")
        // this.logger.info("Hello from Themer!");

        // window.reloadColor = Themer.reload;
        // const DevToolsManager = getByProps("toggleDisplayDevTools");

        // borrow the devtools widget
        // DevToolsManager.updateDevToolsSettings({
        //     showDevWidget: true
        // });

        // this.patcher.instead(DevToolsManager, "toggleDisplayDevTools", (ctx, orig) => {
        //     console.log(ctx.args);
        //     Navigation.push(this.SettingsModal, {
        //         redirect: "SemanticColorsPage"
        //     });
        // });

        // this.patcher.after(getByName("CustomColorPickerActionSheet"), "default", ({ result }, args) => {
        //     console.log(window.b = result);
        // });

        // Navigation.push(this.SettingsModal);
        // this.patcher.instead(ColorManager.meta, "resolveSemanticColor", (ctx, orig) => {
        //     // generate a valid hex color
        //     const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        //     return ctx.result = color;
        // });
    }

    public SettingsModal({ redirect }): JSX.Element {
        const Navigation = aliucord.metro.Navigation ?? getByProps("push", "pushLazy", "pop");
        const DiscordNavigator = aliucord.metro.DiscordNavigator ?? getByProps("getRenderCloseButton");
        const { default: Navigator, getRenderCloseButton } = DiscordNavigator;

        return (
            <Navigator
                initialRouteName={redirect || "MainPage"}
                goBackOnBackPress
                screens={{
                    MainPage: {
                        title: "Themer",
                        headerLeft: getRenderCloseButton(() => Navigation.pop()),
                        render: MainPage
                    },
                    ColorPickerPage: {
                        title: "Color Picker",
                        render: ColorPickerPage
                    },
                    SemanticColorsPage: {
                        title: "Semantic Colors",
                        render: SemanticColorsPage,
                        headerRight: () => <PageSave
                            text="APPLY"
                            onPress={() => {
                                Navigation.pop();
                                reloadColor();
                            }}
                        />
                    },
                    RawColorsPage: {
                        title: "Raw Colors",
                        render: RawColorsPage,
                    }
                }}
            />
        );
    }
}
