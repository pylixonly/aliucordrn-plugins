import { getByProps, Constants, FluxDispatcher } from "aliucord/metro";
import { Plugin } from "aliucord/entities"

const AMOLEDTheme = getByProps("setAMOLEDThemeEnabled");

export default class ThemePatcher extends Plugin {
    public start() {
        this.logger.info("hhhhhh");
        this.initSettings();
        this.logger.info("init settings");

        (window as any).AliuHermes.unfreeze(Constants.ThemeColorMap);
        (window as any).AliuHermes.unfreeze(Constants.Colors);
        (window as any).AliuHermes.unfreeze(Constants.UNSAFE_Colors);

        this.logger.info("unfroze");

        const newTcm = this.settings.get("theme_color_map", {});
        const newColors = this.settings.get("colors", {});

        this.logger.info("Patching theme colors", Constants.ThemeColorMap);
        for (const key in Constants.ThemeColorMap) {
            Constants.ThemeColorMap[key][2] = Constants.ThemeColorMap[key][0];
            if (newTcm[key]) {
                Constants.ThemeColorMap[key][2] = newTcm[key]?.[0];
                Constants.ThemeColorMap[key][1] = newTcm[key]?.[1];

                this.logger.info("Patched theme color", key);
            }
        }

        for (const key in newColors) {
            Constants.Colors[key] = newColors[key];
        }

        AMOLEDTheme.enableAMOLEDThemeOption();
    }

    private initSettings() {
        if (this.settings.get("isSet", undefined) === undefined) {
            this.settings.set("theme_color_map", {
                "ACTIVITY_CARD_BACKGROUND": ["#1e2030", "#1e2030"],
                "BACKGROUND_ACCENT": ["#1e2030", "#1e2030"],
                "BACKGROUND_FLOATING": ["#1e2030", "#1e2030"],
                "BACKGROUND_MENTIONED": ["#ee99a0", "#ee99a0"],
                "BACKGROUND_MENTIONED_HOVER": ["#f5a97f", "#f5a97f"],
                "BACKGROUND_MESSAGE_HOVER": ["#5b6078", "#5b6078"],
                "BACKGROUND_MOBILE_PRIMARY": ["#1e2030", "#1e2030"],
                "BACKGROUND_MOBILE_SECONDARY": ["#1e2030", "#1e2030"],
                "BACKGROUND_MODIFIER_ACCENT": ["#181926", "#181926"],
                "BACKGROUND_MODIFIER_ACTIVE": ["#6e738d", "#6e738d"],
                "BACKGROUND_MODIFIER_HOVER": ["#6e738d", "#6e738d"],
                "BACKGROUND_MODIFIER_SELECTED": ["#5b6078", "#5b6078"],
                "BACKGROUND_NESTED_FLOATING": ["#1e2030", "#1e2030"],
                "BACKGROUND_PRIMARY": ["#1e2030", "#1e2030"],
                "BACKGROUND_SECONDARY": ["#1e2030", "#1e2030"],
                "BACKGROUND_SECONDARY_ALT": ["#1e2030", "#1e2030"],
                "BACKGROUND_TERTIARY": ["#181926", "#181926"],
                "CHAT_BACKGROUND": ["#1e2030", "#1e2030"],
                "CHANNELS_DEFAULT": ["#cad3f5", "#cad3f5"],
                "CHANNEL_ICON": ["#8aadf4", "#8aadf4"],
                "CHANNELTEXTAREA_BACKGROUND": ["#1e2030", "#1e2030"],
                "CONTROL_BRAND_FOREGROUND": ["#1e2030", "#1e2030"],
                "CONTROL_BRAND_FOREGROUND_NEW": ["#1e2030", "#1e2030"],
                "DEPRECATED_CARD_BG": ["#1e2030", "#1e2030"],
                "DEPRECATED_CARD_EDITABLE_BG": ["#1e2030", "#1e2030"],
                "DEPRECATED_QUICKSWITCHER_INPUT_BACKGROUND": ["#1e2030", "#1e2030"],
                "DEPRECATED_QUICKSWITCHER_INPUT_PLACEHOLDER": ["#1e2030", "#1e2030"],
                "DEPRECATED_STORE_BG": ["#1e2030", "#1e2030"],
                "DEPRECATED_TEXT_INPUT_BG": ["#1e2030", "#1e2030"],
                "DEPRECATED_TEXT_INPUT_BORDER": ["#1e2030", "#1e2030"],
                "DEPRECATED_TEXT_INPUT_BORDER_DISABLED": ["#1e2030", "#1e2030"],
                "DEPRECATED_TEXT_INPUT_BORDER_HOVER": ["#1e2030", "#1e2030"],
                "DEPRECATED_TEXT_INPUT_PREFIX": ["#1e2030", "#1e2030"],
                "ELEVATION_HIGH": ["#1e2030", "#1e2030"],
                "ELEVATION_LOW": ["#1e2030", "#1e2030"],
                "ELEVATION_MEDIUM": ["#1e2030", "#1e2030"],
                "ELEVATION_STROKE": ["#1e2030", "#1e2030"],
                "FOCUS_PRIMARY": ["#1e2030", "#1e2030"],
                "GUILD_HEADER_TEXT_SHADOW": ["#1e2030", "#1e2030"],
                "HEADER_PRIMARY": ["#cad3f5", "#cad3f5"],
                "HEADER_SECONDARY": ["#b8c0e0", "#b8c0e0"],
                "INFO_DANGER_BACKGROUND": ["#1e2030", "#1e2030"],
                "INFO_DANGER_FOREGROUND": ["#1e2030", "#1e2030"],
                "INFO_DANGER_TEXT": ["#cad3f5", "#cad3f5"],
                "INFO_HELP_BACKGROUND": ["#1e2030", "#1e2030"],
                "INFO_HELP_FOREGROUND": ["#181926", "#181926"],
                "INFO_HELP_TEXT": ["#cad3f5", "#cad3f5"],
                "INFO_POSITIVE_BACKGROUND": ["#1e2030", "#1e2030"],
                "INFO_POSITIVE_FOREGROUND": ["#181926", "#181926"],
                "INFO_POSITIVE_TEXT": ["#cad3f5", "#cad3f5"],
                "INFO_WARNING_BACKGROUND": ["#1e2030", "#1e2030"],
                "INFO_WARNING_FOREGROUND": ["#181926", "#181926"],
                "INFO_WARNING_TEXT": ["#b8c0e0", "#b8c0e0"],
                "INTERACTIVE_ACTIVE": ["#cad3f5", "#cad3f5"],
                "INTERACTIVE_HOVER": ["#b8c0e0", "#b8c0e0"],
                "INTERACTIVE_MUTED": ["#5b6078", "#5b6078"],
                "INTERACTIVE_NORMAL": ["#cad3f5", "#cad3f5"],
                "LOGO_PRIMARY": ["#8aadf4", "#8aadf4"],
                "SCROLLBAR_AUTO_SCROLLBAR_COLOR_THUMB": ["#6e738d", "#6e738d"],
                "SCROLLBAR_AUTO_SCROLLBAR_COLOR_TRACK": ["#494d64", "#494d64"],
                "SCROLLBAR_AUTO_THUMB": ["#6e738d", "#6e738d"],
                "SCROLLBAR_AUTO_TRACK": ["#494d64", "#494d64"],
                "SCROLLBAR_THIN_THUMB": ["#6e738d", "#6e738d"],
                "SCROLLBAR_THIN_TRACK": ["#494d64", "#494d64"],
                "STATUS_DANGER_BACKGROUND": ["#ed8796", "#ed8796"],
                "STATUS_DANGER_TEXT": ["#8aadf4", "#8aadf4"],
                "STATUS_POSITIVE_BACKGROUND": ["#eed49f", "#eed49f"],
                "STATUS_POSITIVE_TEXT": ["#cad3f5", "#cad3f5"],
                "STATUS_WARNING_BACKGROUND": ["#ee99a0", "#ee99a0"],
                "STATUS_WARNING_TEXT": ["#7f849c", "#7f849c"],
                "TEXTBOX_MARKDOWN_SYNTAX": ["#7dc4e4", "#7dc4e4"],
                "TEXT_DANGER": ["#ed8796", "#ed8796"],
                "TEXT_LINK": ["#b7bdf8", "#b7bdf8"],
                "TEXT_LINK_LOW_SATURATION": ["#cad3f5", "#cad3f5"],
                "TEXT_MUTED": ["#6e738d", "#6e738d"],
                "TEXT_NORMAL": ["#939ab7", "#939ab7"],
                "TEXT_POSITIVE": ["#eed49f", "#eed49f"],
                "TEXT_WARNING": ["#ed8796", "#ed8796"]
            });

            this.settings.set("colors", {
                "BRAND_NEW": "#8839ef",
                "PRIMARY_DARK": "#494d64",
                "PRIMARY_DARK_100": "#cad3f5",
                "PRIMARY_DARK_300": "#cad3f5",
                "PRIMARY_DARK_360": "#c6a0f6",
                "PRIMARY_DARK_400": "#7f849c",
                "PRIMARY_DARK_500": "#24273a",
                "PRIMARY_DARK_600": "#494d64",
                "PRIMARY_DARK_630": "#494d64",
                "PRIMARY_DARK_700": "#494d64",
                "PRIMARY_DARK_800": "#24273a",
                "PRIMARY_DARK_900": "#1e2030",
            });

            this.settings.set("isSet", true);
        }
    }
}