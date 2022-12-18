import { Logger } from "aliucord/utils/Logger";

export let RPLogger: Logger;

export const setLogger = (logger: Logger) => {
    RPLogger = logger;
}