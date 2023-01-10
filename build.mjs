import { spawnSync, execSync } from "child_process";
import { platform } from "process";
import { existsSync } from "fs";
import { join } from "path";
import { argv, cwd, exit } from "process";

function check(bool, message) {
    if (!bool) {
        console.error(message);
        exit(1);
    }
}

let watch;
let deploy;
let plugin = argv[2];
if (plugin === "--watch") {
    watch = true;
    plugin = argv[3];
} else if (plugin === "--deploy") {
    deploy = true;
    plugin = argv[3];
}

let packageName = argv.pop();
if (packageName === argv[2] || packageName === argv[3]) {
    packageName = null;
}

check(!!plugin, `Usage: ${argv.join(" ")} <PLUGIN>`);

let path = null
if (existsSync(join(plugin, "index.ts"))) {
    path = join(plugin, "index.ts")
} else if (existsSync(join(plugin, "index.tsx"))) {
    path = join(plugin, "index.tsx")
}
check(existsSync(path), `No such file: ${path}`);

const proc = spawnSync((platform === "win32") ? ".\\node_modules\\.bin\\rollup.cmd" : "node_modules/.bin/rollup", ["-c", "--configPlugin", "typescript", watch && "--watch"].filter(Boolean), {
    stdio: "inherit",
    cwd: cwd(),
    env: {
        plugin
    }
});

if (proc.error) {
    console.error(proc.error)
} else if (deploy) {
    const exec = (cmd) => execSync(cmd, { stdio: "inherit" });
    console.log("Deploying plugin to device...");
    exec(`adb push ./dist/${plugin}.zip /sdcard/AliucordRN/plugins/`);
    exec(`adb shell am force-stop ${packageName ?? "com.aliucord"}`)
    exec(`adb shell am start -S -n ${packageName ?? "com.aliucord"}/com.discord.main.MainActivity`)
}