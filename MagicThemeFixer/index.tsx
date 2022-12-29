import { getByProps, FluxDispatcher } from "aliucord/metro";
import { Plugin } from "aliucord/entities"

const AMOLEDTheme = getByProps("setAMOLEDThemeEnabled");

export default class MagicThemeFixer extends Plugin {
    public start() {
        // set AMOLED theme manually
        const turnONAMOLED = this.settings.get("setAMOLED", false);
        this.logger.info(`AMOLED theme is turned ${turnONAMOLED ? "on" : "off"}`);
        turnONAMOLED && AMOLEDTheme.enableAMOLEDThemeOption();

        this.patcher.before(AMOLEDTheme, "setAMOLEDThemeEnabled", (ctx) => {
            this.settings.set("setAMOLED", ctx.args[0]);
            this.logger.info("setAMOLEDThemeEnabled", ctx.args[0]);
        });

        FluxDispatcher.subscribe("I18N_LOAD_START", () => {
            this.logger.info("overriding on I18N_LOAD_START");
            getByProps("overrideTheme").overrideTheme(getByProps("theme")?.theme ?? 'dark')
        });
    }

    public stop() {
    }
}