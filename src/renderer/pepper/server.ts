import { serialize } from "@/pepper/db";
import { translate } from "@/pepper/translators";
import Koa from "koa";
import KoaRouter from "koa-router";
import Library from ".";

const app = new Koa();
const router = new KoaRouter();

router.post("/add/:url", async (ctx, next) => {
    const { url } = ctx.params;
    const decodedUrl = decodeURI(url);
    console.log(`will translate ${decodedUrl}`);
    try {
        Library.add(await translate(decodedUrl));
        ctx.body = "success";
    } catch {
        //
        ctx.body = "fail";
    }

    ctx.set("Access-Control-Allow-Origin", "*");
});

router.get("/",  async (ctx, next) => {
    ctx.body = JSON.stringify(Library.structure);
    ctx.set("Access-Control-Allow-Origin", "*");
});

app.use(router.routes()).use(router.allowedMethods());

const port = 9999;
app.listen(port, () => {
    console.log("listening");
});
