import { Bot, Context, InlineKeyboard } from "grammy";
import { createSolanaAddress } from "./utils/createSolanaAddress";
import { getPrivateKeyBase58 } from "./utils/getPrivateKeyBase58";
import { getUserFromDB } from "./utils/getUserFromDB";
import { saveUserData } from "./utils/saveUserData";
import "dotenv/config";
import { updateAndSaveReferData } from "./utils/updateAndSaveReferData";

// const BOT_NAME = "LiquidHeartsBot";

const bot = new Bot(process.env.BOT_TOKEN!);

const webLink = process.env.WEB_LINK!;

const bagsLink = `${webLink}/bags`;
const directoryUrl = `${process.env.WEB_LINK}/directory`;
const sendTokensUrl = `${process.env.WEB_LINK}/send_tokens`;

const buildMainMenuButtons = (id: number) => [
  [
    InlineKeyboard.webApp("Check Bags 💰", `${bagsLink}?user=${id}`),
    InlineKeyboard.webApp("Display Status 🏆", `${directoryUrl}?user=${id}`)
  ],
  [
    InlineKeyboard.webApp("Send Tokens 💸", `${sendTokensUrl}?user=${id}`),
    InlineKeyboard.url("Join Group 👋", `https://t.me/LiquidHeartsClub`),
  ],
];

bot.command("start", async (ctx) => {
  if (!ctx.from) return;

  const referrerId = ctx.message.text.replace("/start ", "");

  const waitText = "Wait for a moment to the bot to initialize...";

  const messageEntity = await ctx.reply(waitText);

  let savedUser = await getUserFromDB(ctx.from.id);

  const text = `Congratulations! You’ve created your Social Wallet! ❤️‍🔥\nHere is your wallet address:`;

  const secondText = "What would you like to do next?";

  if (!savedUser) {
    const profilePhotos = await ctx.api.getUserProfilePhotos(ctx.from.id);

    const newAddress = createSolanaAddress();

    const photo = profilePhotos.photos[0];

    const file = photo ? photo[0] ? await ctx.api.getFile(photo[0].file_id) : { file_path: "" } : { file_path: "" };

    const newUser = {
      addressPrivateKey: getPrivateKeyBase58(newAddress.secretKey),
      addressPublicKey: newAddress.publicKey.toBase58(),
      bio: "",
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name || "",
      telegramId: ctx.from.id,
      username: ctx.from.username || "",
      image: file.file_path || "",
      referredUsers: 0,
    };

    const insertedId = await saveUserData(newUser);

    if (referrerId) {
      const referrer = await getUserFromDB(Number(referrerId));

      if (referrer?._id) {
        await updateAndSaveReferData(referrer?._id, insertedId);
        await bot.api.deleteMessage(messageEntity.chat.id, messageEntity.message_id);

        await bot.api.sendMessage(Number(referrerId), `Congratulations! ${newUser.firstName} activated on Liquid Hearts Club from your link. Your share of the next airdrop just increased by 100 points! Send them a [welcome message](https://t.me/${newUser.username}) so they feel at home.`, {
          parse_mode: "Markdown",
        });

        await ctx.reply(`Congratulations! By following ${referrer.firstName}'s activation link, your share of the next airdrop increased by 100 points! Send them a [thank you message](https://t.me/${referrer.username}) for inviting you to Liquid Hearts Club.`, {
          parse_mode: "Markdown"
        });

        await ctx.reply("I’ve created your Social Wallet! ❤️‍🔥\nHere is your wallet address:");
        await ctx.reply(newUser.addressPublicKey);
        await ctx.reply("Here is your personal Activation Link. When your friends activate Liquid Hearts Club through this link, you’ll increase your share of the next airdrop! 🪂")
        await ctx.reply(`https://t.me/LiquidHeartsBot?start=${newUser.telegramId}`);
        await ctx.reply("What would you like to do next?", {
            reply_markup: {
              inline_keyboard: buildMainMenuButtons(ctx.from.id),
            }
          }
        );

        return;
      }
    }

    savedUser = newUser;
  }

  await bot.api.deleteMessage(messageEntity.chat.id, messageEntity.message_id);

  await ctx.reply(text);
  await ctx.reply(savedUser?.addressPublicKey || "");
  await ctx.reply(secondText, {
    reply_markup: {
      inline_keyboard: buildMainMenuButtons(ctx.from.id)
    }
  })
});

bot.catch((error) => {
  console.log(error.message);
  console.log(error.stack);
  const genericErrorMessage =
    "Sorry, something went wrong. Please try again later or communicate with Support";
  error.ctx.reply(genericErrorMessage);
});

const showMenu = async (ctx: Context) => {
  const text = `👋 Hey! Do you want to check your bags, display your status, send tokens or join the group?`;
  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: buildMainMenuButtons(ctx.from?.id || 0),
    },
  });
};

const showCheckBags = async (ctx: Context) => {
  const text = "Curious about what you got in your bags? You’ve come to the right place!";
  await ctx.reply(text, 
    {
      reply_markup: {
        inline_keyboard: [[InlineKeyboard.webApp("Check Bags 💰", `${bagsLink}?user=${ctx.from?.id}`)]]
      }}
  )
}

const showDisplayLeaderboard = async (ctx: Context) => {
  const text = "Where do you rank? Let’s display the status and find out.";
  await ctx.reply(text, 
    {
      reply_markup: {
        inline_keyboard: [[InlineKeyboard.webApp("Display Status 🏆", `${directoryUrl}?user=${ctx.from?.id}`)]]
      } 
    }
  )
}

const showSendTokens = async (ctx: Context) => {
  const text = "Want to send money, coins, badges or NFTs? That’s easy! Just let me know what to send and where you want them to go.";
  await ctx.reply(text, 
    {
      reply_markup: {
        inline_keyboard: [[InlineKeyboard.webApp("Send Tokens 💸", `${sendTokensUrl}?user=${ctx.from?.id}`)]]
      } 
    }
  )
}

const showJoinGroup = async (ctx: Context) => {
  const text = "Join our team and your fellow Liquid Hearts Club members in Visitors Center for guidance on getting the most out of your Social Wallet on Telegram.";
  await ctx.reply(text, 
    {
      reply_markup: {
        inline_keyboard: [[InlineKeyboard.url("Join Group 👋", `https://t.me/LiquidHeartsClub`)]]
      } 
    }
  )
}

bot.command("main", showMenu);
bot.command("bags", showCheckBags);
bot.command("send", showSendTokens);
bot.command("join", showJoinGroup);
bot.command("status", showDisplayLeaderboard);

bot.api.setMyCommands([
  {
    command: "main",
    description: "Main Menu",
  },
  {
    command: "bags",
    description: "Check Bags",
  },
  {
    command: "send",
    description: "Send Tokens",
  },
  {
    command: "join",
    description: "Join Group"
  },
  {
    command: "status",
    description: "Display Status"
  }
]);

//Start the Bot
bot.start();
