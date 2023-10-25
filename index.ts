import { Bot, Context, InlineKeyboard } from "grammy";
import { createSolanaAddress } from "./utils/createSolanaAddress";
import { getPrivateKeyBase58 } from "./utils/getPrivateKeyBase58";
import { getUserFromDB } from "./utils/getUserFromDB";
import { saveUserData } from "./utils/saveUserData";
import "dotenv/config";

const BOT_NAME = "MoralPanicBot";

const bot = new Bot(process.env.BOT_TOKEN!);

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

const webLink = process.env.WEB_LINK!;

const bagsLink = `${webLink}/bags`;

const buttons = [commands.map((val) => InlineKeyboard.text(val))];

const moreCommandsMarkup = InlineKeyboard.from(buttons);

bot.command("commands", async (ctx) => {
  await ctx.reply(secondMenu, {
    parse_mode: "HTML",
    reply_markup: moreCommandsMarkup,
  });
});

bot.command("getscoutlink", (ctx) => {
  const id = ctx.from?.id;

  const link = `https://t.me/${BOT_NAME}?start=${id}`;

  ctx.reply(link);
});

bot.command("start", async (ctx) => {
  if (!ctx.from) return;
  const waitText = "Wait for a moment to the bot to initialize...";

  const messageEntity = await ctx.reply(waitText);

  let savedUser = await getUserFromDB(ctx.from.id);

  const text = `Welcome to your Saddlebags, the Social Wallet! 🤝\n\nI’m a super simple way to send and receive tokens on Telegram. 🤑\n\nYou can also earn points to use in some amazing apps! 🏆\n\nTo view the main menu at any time, just type /main or press the little blue Menu Button on the lower left. ✅\n\n🔗 Some important links:\n🪂 Sign up at our website for special airdrops and rewards:\nhttps://www.saddlebags.xyz\n𝕏 Follow us on X (Twitter): https://x.com/saddlebags_xyz\n🛟 Join our mods and your fellow members at:\nhttps://t.me/saddlebags_support\n\nTo get started, add some funds in USDC to your Saddlebags. Here’s your Saddlebags address on the Solana network:`;

  if (!savedUser) {
    const profilePhotos = await ctx.api.getUserProfilePhotos(ctx.from.id);

    const newAddress = createSolanaAddress();

    const photo = profilePhotos.photos[0];
    const photoData = photo ? photo[0]?.file_unique_id : "";

    const newUser = {
      addressPrivateKey: getPrivateKeyBase58(newAddress.secretKey),
      addressPublicKey: newAddress.publicKey.toBase58(),
      bio: "",
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name || "",
      telegramId: ctx.from.id,
      username: ctx.from.username || "",
      image: photoData,
      referredUsers: 0,
    };

    await saveUserData(newUser);
    savedUser = newUser;
  }

  await bot.api.deleteMessage(messageEntity.chat.id, messageEntity.message_id);

  await ctx.reply(text);
  await ctx.reply(savedUser?.addressPublicKey || "");
});

bot.catch((error) => {
  console.log(error.message);
  console.log(error.stack);
  const genericErrorMessage =
    "Sorry, something went wrong. Please try again later or communicate with Support";
  error.ctx.reply(genericErrorMessage);
});

const directoryUrl = `${process.env.WEB_LINK}/directory`;

const buildMainMenuButtons = (userId: number) => [
  [
    InlineKeyboard.webApp("👀 Check Bags", `${bagsLink}?user=${userId}`),
    InlineKeyboard.text("💰Add Tokens", "add-tokens"),
  ],
  [
    InlineKeyboard.text("💸 Send Tokens", "send-tokens"),
    InlineKeyboard.webApp("📖 Directory", `${directoryUrl}?user=${userId}`),
  ],
  [InlineKeyboard.text("🪄Apps", "open-apps")],
];

const buildSendTokenButtons = (userId: number) => [
  [
    InlineKeyboard.text("🪧 Main Menu", "main-menu"),
    InlineKeyboard.webApp("👀 Check Bags", `${bagsLink}?user=${userId}`),
  ],
  [
    InlineKeyboard.text("💸 Send Tokens", "send-tokens"),
    InlineKeyboard.webApp("📖 Directory", `${directoryUrl}?user=${userId}`),
  ],
  [InlineKeyboard.text("🪄Apps", "open-apps")],
];

const buildMagicAppsButtons = (userId: number) => [
  [
    InlineKeyboard.text("🪧 Main Menu", "main-menu"),
    InlineKeyboard.webApp("👀 Check Bags", `${bagsLink}?user=${userId}`),
  ],
  [
    InlineKeyboard.text("💰Add Tokens", "add-tokens"),
    InlineKeyboard.text("💸 Send Tokens", "send-tokens"),
  ],
  [InlineKeyboard.webApp("📖 Directory", `${directoryUrl}?user=${userId}`)],
];

const showMenu = async (ctx: Context) => {
  const text = `👋 Hey! Do you want to check your Saddlebags, add tokens, send tokens to a friend, search the membership directory or mess around with some magic apps?`;
  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: buildMainMenuButtons(ctx.from!.id),
    },
  });
};

const showAddTokens = async (ctx: Context) => {
  const user = await getUserFromDB(ctx.from!.id);
  const text = `👋 Hey! Want to add tokens to your Saddlebags? Just copy your own personal Saddlebags address on the Solana network (I’ll drop it below) and you can send 'em right there!\n\n🤝 Your Saddlebags address:`;

  await ctx.reply(text);
  await ctx.reply(user?.addressPublicKey || "", {
    reply_markup: {
      inline_keyboard: buildSendTokenButtons(ctx.from!.id),
    },
  });
};

const showMagicApps = async (ctx: Context) => {
  const text = `👋 Hey! You can use your points in any of these magical apps! (Actually, there’s just one for now, but it’s super cool! If you’re a developer, creator or project founder and you want to add you’re own app to Saddlebags, let us know at https://saddlebags.xyz/).\n\n😱 Moral Panic: A massively-multiplayer on-chain game.\n\nJoin a club, form a guild, build an empire… for fun, profit and the thrill of planetary ecosystem collapse!\n\nStart here: https://t.me/MoralPanicBot`;

  await ctx.reply(text, {
    reply_markup: {
      inline_keyboard: buildMagicAppsButtons(ctx.from!.id),
    },
  });
};

bot.callbackQuery("main-menu", showMenu);
bot.callbackQuery("add-tokens", showAddTokens);
bot.callbackQuery("open-apps", showMagicApps);

bot.command("main", showMenu);
bot.command("add", showAddTokens);
bot.command("apps", showMagicApps);

bot.api.setMyCommands([
  {
    command: "main",
    description: "Main Menu",
  },
  {
    command: "check",
    description: "Check Bags",
  },
  {
    command: "add",
    description: "Add Tokens",
  },
  {
    command: "send",
    description: "Send Tokens",
  },
  {
    command: "members",
    description: "Membership Directory",
  },
  {
    command: "apps",
    description: "Magic Apps",
  },
]);

//Start the Bot
bot.start();
