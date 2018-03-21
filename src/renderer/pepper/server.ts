import database, { serialize } from "@/pepper/db";
import { translate } from "@/pepper/translators";
import debug from "debug";
import Koa from "koa";
import KoaBodyparser from "koa-bodyparser";
import KoaRouter from "koa-router";
import Library from ".";

const log = debug("pepper:server");

const app = new Koa();
const router = new KoaRouter();

router.post("/add", async (ctx, next) => {
    const { url, cursor } = ctx.request.body;
    try {
        // log(`will add ${url} to ${cursor}`);
        Library.add(await translate(url), database.folder.findById(cursor));
        ctx.body = "success";
    } catch {
        //
        ctx.body = "fail";
    }
});

router.get("/",  async (ctx, next) => {
    ctx.body = JSON.stringify({
        structure: Library.structure,
        cursor: Library.cursor._id,
    });
});

app.use(KoaBodyparser());
app.use(async (ctx, next) => {
    await next();
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Headers",
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
});
app.use(router.routes()).use(router.allowedMethods());

const port = 9999;
app.listen(port, () => {
    log(`Listening to port ${port}`);
});
