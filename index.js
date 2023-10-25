"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const createSolanaAddress_1 = require("./utils/createSolanaAddress");
const getPrivateKeyBase58_1 = require("./utils/getPrivateKeyBase58");
const getUserBio_1 = require("./utils/getUserBio");
const getUserFromDB_1 = require("./utils/getUserFromDB");
const saveUserData_1 = require("./utils/saveUserData");
//Create a new bot
const bot = new grammy_1.Bot("6550085262:AAH8pIlifQoxggh7C7J1wRK06Ge1Z_CaITE");
//This function handles the /scream command
bot.command("scream", () => { });
const secondMenu = "Here are all the commands available to you at this time";
const commands = [
    "Check Account",
    "Link Wallet",
    "Buy OPOS",
    "Swap Coins",
    "Send Coins",
    "Mint Badges",
    "Send Badges",
    "Airdrops",
    "Giveaways",
    "Challenges",
    "Grants",
];
const buttons = [commands.map((val) => grammy_1.InlineKeyboard.text(val))];
const moreCommandsMarkup = grammy_1.InlineKeyboard.from(buttons);
bot.command("commands", async (ctx) => {
    await ctx.reply(secondMenu, {
        parse_mode: "HTML",
        reply_markup: moreCommandsMarkup,
    });
});
bot.on("message", async (ctx) => {
    const message = ctx.message.text;
    // if (message === "/pay") {
    // const prices = [
    // {
    // label: "Donation",
    // amount: 100, // if you have a decimal price with . instead of ,
    // },
    // ];
    // bot.api.sendInvoice(
    // ctx.chat.id,
    // "Test Payment",
    // "Test Description",
    // "Test Payload",
    // "284685063:TEST:YTUwY2IzYWJkMzU4",
    // "USD",
    // prices
    // );
    // }
    if (message === "/start") {
        console.log("User info: ", ctx.from);
        console.log(`${ctx.from.first_name} wrote ${"text" in ctx.message ? ctx.message.text : ""}`);
        const savedUser = await (0, getUserFromDB_1.getUserFromDB)(ctx.from.id);
        if (!savedUser) {
            const profilePhotos = await ctx.api.getUserProfilePhotos(ctx.from.id);
            const bio = await (0, getUserBio_1.getUserBio)(ctx.from.username || "");
            const newAddress = (0, createSolanaAddress_1.createSolanaAddress)();
            const photo = profilePhotos.photos[0];
            const photoData = photo ? photo[0]?.file_unique_id : "";
            await (0, saveUserData_1.saveUserData)({
                addressPrivateKey: (0, getPrivateKeyBase58_1.getPrivateKeyBase58)(newAddress.secretKey),
                addressPublicKey: newAddress.publicKey.toBase58(),
                bio: bio,
                firstName: ctx.from.first_name,
                lastName: ctx.from.last_name || "",
                telegramId: ctx.from.id,
                username: ctx.from.username || "",
                image: photoData,
            });
        }
    }
    const waitText = "Wait for a moment to the bot to initialize...";
    const messageEntity = await ctx.reply(waitText);
    const keyboardButton = grammy_1.InlineKeyboard.from([
        [grammy_1.InlineKeyboard.text("Go to Hobo Camp")],
    ]);
    await bot.api.deleteMessage(messageEntity.chat.id, messageEntity.message_id);
    const firstText = `Welcome to Moral Panic, ${ctx.from.first_name}!\n\nAs an Uninvited Guest you’ll begin your adventure in the hobo camp under the bridge. Have fun!`;
    await ctx.reply(firstText, {
        reply_markup: keyboardButton,
    });
});
//Start the Bot
bot.start();
