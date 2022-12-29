import { getByProps, FluxDispatcher } from "aliucord/metro";
import { Plugin } from "aliucord/entities"

const AMOLEDTheme = getByProps("setAMOLEDThemeEnabled");

export default class MagicThemeFixer extends Plugin {
    public async start() {
        // set AMOLED theme manually
        const turnONAMOLED = this.settings.get("setAMOLED", false);
        this.logger.info(`AMOLED theme is turned ${turnONAMOLED ? "on" : "off"}`);
        turnONAMOLED && AMOLEDTheme.enableAMOLEDThemeOption();

        this.patcher.before(AMOLEDTheme, "setAMOLEDThemeEnabled", (ctx) => {
            this.settings.set("setAMOLED", ctx.args[0]);
            this.logger.info("setAMOLEDThemeEnabled", ctx.args[0]);
        });

        // can't unpatch, else app will be unusable
        let hit = false;
        this.patcher.before(FluxDispatcher, "dispatch", (ctx) => {
            if (hit) return;

            if (ctx.args[0].type !== "USER_SETTINGS_THEME_OVERRIDE") {
                hit = true;

                (async () => {
                    this.logger.info("Doing the magic...");
                    getByProps("overrideTheme").overrideTheme();
                })();
            }
        });
    }

    public stop() {
    }
}