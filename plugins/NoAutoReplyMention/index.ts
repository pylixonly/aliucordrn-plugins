import { Plugin } from "aliucord/entities";
import { getByProps } from "aliucord/metro";

const ReplyModule = getByProps("createPendingReply");

export default class NoAutoReplyMention extends Plugin {
    public start() {
        this.patcher.before(ReplyModule, "createPendingReply", (_, reply) => {
            reply.shouldMention = false;
        });
    }
}
