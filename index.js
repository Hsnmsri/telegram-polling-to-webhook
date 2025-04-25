import {
    Telegraf
} from 'telegraf';
import axios from 'axios';
import {
    HttpsProxyAgent
} from 'https-proxy-agent';
import env from "./env.js"
process.removeAllListeners('warning');

let silentLog = false;
let oneLine = false;

/**
 * Print Help
 */
function printHelp() {
    console.log(
        `Polling To Webhook

 -h --help   Print help
 --one-line  Print logs on one line
 --silent    Run without print logs
        `);
}

function main(args) {
    // check args
    if (args.findIndex(arg => arg == "-h" || arg == "--help") != -1) {
        printHelp();
        return;
    }
    if (args.findIndex(arg => arg == "--one-line") != -1) oneLine = true;
    if (args.findIndex(arg => arg == "--silent") != -1) silentLog = true;

    let telegrafOptions = {}

    // Proxy
    if (env.proxy != null && env.proxy.trim() != "") {
        const proxyAgent = new HttpsProxyAgent(env.proxy);
        telegrafOptions = {
            telegram: {
                agent: proxyAgent
            }
        }
    }

    // Telegraf initialize
    const bot = new Telegraf(env.token, telegrafOptions);

    bot.use(async (ctx) => {
        try {
            const update = ctx.update;
            if (!silentLog && !oneLine) console.log('📥 Telegram new update:', update);
            if (!silentLog && oneLine) console.log('📥 Telegram new update recived!');

            const response = await axios.post(env.webhook_url, update);
            if (!silentLog && !oneLine) console.log('✅ Update forwarded:', response.status);
            if (!silentLog && oneLine) console.log('✅ Update forwarded.', response.status);

        } catch (error) {
            if (!silentLog && !oneLine) console.error('❌ Forward failed:', error.message);
            if (!silentLog && oneLine) console.error('❌ Forward failed.', error.message);
        }
    });

    bot.launch();
    console.log('🚀 Polling bridge enabled! (for development)');

}

main(process.argv);