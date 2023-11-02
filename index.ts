import { Bot, Context, InlineKeyboard } from "grammy";
import { createSolanaAddress } from "./utils/createSolanaAddress";
import { getPrivateKeyBase58 } from "./utils/getPrivateKeyBase58";
import { getUserFromDB } from "./utils/getUserFromDB";
import { saveUserData } from "./utils/saveUserData";
import "dotenv/config";

const BOT_NAME = "LiquidHeartsBot";

const bot = new Bot(process.env.BOT_TOKEN!);

const webLink = process.env.WEB_LINK!;

const bagsLink = `${webLink}/bags`;
const directoryUrl = `${process.env.WEB_LINK}/directory`;
const sendTokensUrl = `${process.env.WEB_LINK}/send_tokens`;

const buildMainMenuButtons = () => [
  [
    InlineKeyboard.text("Check Bags 💰", `check-bags`),
    InlineKeyboard.text("Display Leaderboard 🏆", "display-leaderboard"),
  ],
  [
    InlineKeyboard.text("Send Tokens 💸", "send-tokens"),
    InlineKeyboard.text("Join Group 👋", "join-group"),
  ],
];

bot.command("start", async (ctx) => {
  if (!ctx.from) return;
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

    await saveUserData(newUser);
    savedUser = newUser;
  }

  await bot.api.deleteMessage(messageEntity.chat.id, messageEntity.message_id);

  await ctx.reply(text);
  await ctx.reply(savedUser?.addressPublicKey || "");
  await ctx.reply(secondText, {
    reply_markup: {
      inline_keyboard: buildMainMenuButtons()
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

// const buildSendTokenButtons = (userId: number) => [
//   [
//     InlineKeyboard.text("🪧 Main Menu", "main-menu"),
//     InlineKeyboard.webApp("👀 Check Bags", `${bagsLink}?user=${userId}`),
//   ],
//   [
//     InlineKeyboard.webApp("💸 Send Tokens", `${sendTokensUrl}?user=${userId}`),
//     InlineKeyboard.webApp("📖 Directory", `${directoryUrl}?user=${userId}`),
//   ],
//   [InlineKeyboard.text("🪄Apps", "open-apps")],
// ];

// const buildMagicAppsButtons = (userId: number) => [
//   [
//     InlineKeyboard.text("🪧 Main Menu", "main-menu"),
//     InlineKeyboard.webApp("👀 Check Bags", `${bagsLink}?user=${userId}`),
//   ],
//   [
//     InlineKeyboard.text("💰Add Tokens", "add-tokens"),
//     InlineKeyboard.webApp("💸 Send Tokens", `${sendTokensUrl}?user=${userId}`),
//   ],
//   [InlineKeyboard.webApp("📖 Directory", `${directoryUrl}?user=${userId}`)],
// ];

const showMenu = async (ctx: Context) => {
  const text = `👋 Hey! Do you want to check your Saddlebags, add tokens, send tokens to a friend, search the membership directory or mess around with some magic apps?`;
  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: buildMainMenuButtons(),
    },
  });
};

const showCheckBags = async (ctx: Context) => {
  const text = "Curious about what you got in your bags? You’ve come to the right place!";
  await ctx.reply(text, 
    {
      reply_markup: {
        inline_keyboard: [[InlineKeyboard.webApp("Check Bags 💰", `${bagsLink}?user=${ctx.from?.id}`)]]
      } 
    }
  )
}

const showDisplayLeaderboard = async (ctx: Context) => {
  const text = "Where do you rank? Let’s display the leaderboard and find out.";
  await ctx.reply(text, 
    {
      reply_markup: {
        inline_keyboard: [[InlineKeyboard.webApp("Display Leaderboard 🏆", `${directoryUrl}?user=${ctx.from?.id}`)]]
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

// const showAddTokens = async (ctx: Context) => {
//   const user = await getUserFromDB(ctx.from!.id);
//   const text = `👋 Hey! Want to add tokens to your Saddlebags? Just copy your own personal Saddlebags address on the Solana network (I’ll drop it below) and you can send 'em right there!\n\n🤝 Your Saddlebags address:`;
//
//   await ctx.reply(text);
//   await ctx.reply(user?.addressPublicKey || "", {
//     reply_markup: {
//       inline_keyboard: buildSendTokenButtons(ctx.from!.id),
//     },
//   });
// };

// const showMagicApps = async (ctx: Context) => {
//   const text = `👋 Hey! You can use your points in any of these magical apps! (Actually, there’s just one for now, but it’s super cool! If you’re a developer, creator or project founder and you want to add you’re own app to Saddlebags, let us know at https://saddlebags.xyz/).\n\n😱 Moral Panic: A massively-multiplayer on-chain game.\n\nJoin a club, form a guild, build an empire… for fun, profit and the thrill of planetary ecosystem collapse!\n\nStart here: https://t.me/MoralPanicBot`;
//
//   await ctx.reply(text, {
//     reply_markup: {
//       inline_keyboard: buildMagicAppsButtons(ctx.from!.id),
//     },
//   });
// };

bot.callbackQuery("main-menu", showMenu);
// bot.callbackQuery("add-tokens", showAddTokens);
bot.callbackQuery("check-bags", showCheckBags);
bot.callbackQuery("send-tokens", showSendTokens);
bot.callbackQuery("join-group", showJoinGroup);
bot.callbackQuery("display-leaderboard", showDisplayLeaderboard);

bot.command("main", showMenu);
// bot.command("add", showAddTokens);
bot.command("bags", showCheckBags);
bot.command("send", showSendTokens);
bot.command("join", showJoinGroup);
bot.command("leaderboard", showDisplayLeaderboard);

bot.api.setMyCommands([
  {
    command: "main",
    description: "Main Menu",
  },
  {
    command: "bags",
    description: "Check Bags",
  },
  // {
  //   command: "add",
  //   description: "Add Tokens",
  // },
  {
    command: "send",
    description: "Send Tokens",
  },
  // {
  //   command: "members",
  //   description: "Membership Directory",
  // },
  // {
  //   command: "apps",
  //   description: "Magic Apps",
  // },
  {
    command: "join",
    description: "Join Group"
  },
  {
    command: "leaderboard",
    description: "Display Leaderboard"
  }
]);

//Start the Bot
bot.start();
