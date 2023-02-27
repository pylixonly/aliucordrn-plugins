import { spawnSync, execSync } from "child_process";
import { platform } from "process";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { argv, cwd, exit } from "process";

// get all arguments
const args = argv.slice(2);

const plugin = args.find(arg => !arg.startsWith("--"));

if (!plugin) {
    console.error("ERROR: No plugin specified");
    console.error("Usage: npm run build <plugin> [--watch] [--package=<package-name>]");
    exit(1);
}

const packageName = args.find(arg => arg.startsWith("--package="))?.split("=")[1];
const watch = args.includes("--watch") || args.includes("-w");

const pluginDir = join("plugins", plugin);
const entry = readdirSync(pluginDir).find(file => file.startsWith("index."));
const entryPath = join(pluginDir, entry);

const rollupExec = platform === "win32" ? ".\\node_modules\\.bin\\rollup.cmd" : "node_modules/.bin/rollup";
const rollupArgs = ["-c", "--configPlugin", "typescript", watch && "--watch"].filter(Boolean);
const env = {
    plugin,
    pluginDir,
    entryPath,
    packageName
};

const proc = spawnSync(rollupExec, rollupArgs, {
    stdio: "inherit",
    cwd: cwd(),
    env
});

if (proc.error) {
    console.error(proc.error)
}