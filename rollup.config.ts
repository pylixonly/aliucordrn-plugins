import { aliucordPlugin, makeManifest, makePluginZip } from "@aliucord/rollup-plugin";
import { defineConfig } from "rollup";

export default defineConfig({
    input: process.env.entryPath, //`${process.env.plugin}/index.tsx`,
    output: {
        file: `dist/${process.env.plugin}.js`
    },
    onwarn: (warning, warn) => {
        if ([
            "CIRCULAR_DEPENDENCY",
            "UNUSED_EXTERNAL_IMPORT",
            "MISSING_NAME_OPTION_FOR_IIFE_EXPORT",
            "EVAL"
        ].includes(warning.code!)) return;

        if (
            warning.code === "UNRESOLVED_IMPORT"
            && warning.source?.startsWith("aliucord")
        ) return;

        warn(warning);
    },
    plugins: [
        aliucordPlugin({
            autoDeploy: !!process.env.ROLLUP_WATCH,
            packageName: process.env.packageName || "com.aliucord"
        }),
        makeManifest({
            baseManifest: "baseManifest.json",
            manifest: `${process.env.pluginDir}/manifest.json`
        }),
        makePluginZip()
    ]
});
