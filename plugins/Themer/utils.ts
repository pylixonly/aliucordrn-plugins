import { FluxDispatcher, getByProps, getModule, ThemeStore, UnsyncedUserSettingsStore } from "aliucord/metro";

export const { RawColor, SemanticColor } = getByProps("SemanticColor");

const normalizeColor = getModule(x => x.name === "normalizeColor");

export function getCurrentThemeName(): "dark" | "light" | "amoled" {
    return ["dark", "light", "amoled"][getCurrentTheme()] as any;
}

export function getCurrentTheme(): number {
    const { theme } = ThemeStore;
    const { useAMOLEDTheme } = UnsyncedUserSettingsStore;

    return theme === "dark" ? (useAMOLEDTheme === 2 ? 2 : 0) : 1;
}

export async function reloadColor() {
    const orig = UnsyncedUserSettingsStore.useAMOLEDTheme;
    const dispatch = (val) => FluxDispatcher.dispatch({
        type: "UNSYNCED_USER_SETTINGS_UPDATE",
        settings: { useAMOLEDTheme: val }
    });

    await dispatch([0, 1, 2].find(x => x !== orig));
    await dispatch(orig);
}

export function normalizeColorToHex(color: any): string {
    color = normalizeColor(color).toString(16).padStart(6, "0");
    return "#" + (color.length === 8 && color.endsWith("ff") ? color.slice(0, -2) : color);
}

export function getColorMap(theme: string) {
    return Object.fromEntries(
        Object.entries(
            SemanticColor
        ).map(([k, v]: any) => [k, RawColor[v[theme].raw]])
    );
}
