import { getByProps, MessageStore, ReactNative } from "aliucord/metro";
import { Plugin } from "aliucord/entities"

const { DCDChatManager } = ReactNative.NativeModules;
const UserStore = getByProps("getUser");

const PronounMapping = {
    hh: "he/him",
    hi: "he/it",
    hs: "he/she",
    ht: "he/they",
    ih: "it/him",
    ii: "it/its",
    is: "it/she",
    it: "it/they",
    shh: "she/he",
    sh: "she/her",
    si: "she/it",
    st: "she/they",
    th: "they/he",
    ti: "they/it",
    ts: "they/she",
    tt: "they/them",
    any: "any",
    other: "other pronouns",
    ask: "ask me my pronouns",
    avoid: "avoid pronouns, use my name",
    unspecified: "unspecified"
} as Record<string, string>;

export default class PronounDB extends Plugin {
    pronounMap = {};

    isFetching: boolean = false;
    queue: string[] = [];

    public async fetchPronoun(id: string) {
        if (this.pronounMap[id]) return;

        id && this.queue.push(id);

        if (this.isFetching) {
            return;
        }

        const queue = this.queue.splice(0, 15);

        const params = new URLSearchParams();
        params.append("platform", "discord");
        params.append("ids", queue.join(","));

        this.isFetching = true;
        const data = await fetch(`https://pronoundb.org/api/v1/lookup-bulk?${params.toString()}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "X-PronounDB-Source": "AliucordRN"
            }
        }).then(res => res.json());

        for (const [id, pronoun] of Object.entries(data)) {
            // console.log(id, pronoun);
            if (!+id) continue;

            this.pronounMap[id] = pronoun;
        }

        this.isFetching = false;
        if (this.queue.length > 0) this.fetchPronoun(null!);
    }

    public start() {
        this.patcher.before(UserStore, "getUser", (ctx, id) => {
            this.fetchPronoun(id);
        })

        this.patcher.before(DCDChatManager, "updateRows", ({ args }) => {
            const rows = JSON.parse(args[1]);
            for (const row of rows) {
                if (row.type !== 1) continue; // is not a message

                if (row.message.authorId && row.message.timestamp && this.pronounMap[row.message.authorId]) {
                    row.message.timestamp += " • " + PronounMapping[this.pronounMap[row.message.authorId]];
                }
            }

            args[1] = JSON.stringify(rows);
        });
    }
}