import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Events, PermissionsBitField } from 'discord.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PORT = process.env.PORT || 3000;
const PREFIX_CHANNEL_ID = process.env.PREFIX_CHANNEL_ID;

client.login(process.env.DISCORD_TOKEN);

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const guild = newState.guild;

  // Користувач увійшов у спеціальний канал для створення голосового каналу
  if (newState.channelId === PREFIX_CHANNEL_ID) {
    // Створюємо новий голосовий канал
    const newVoiceChannel = await guild.channels.create({
      name: `${newState.member.user.username}'s Channel`,
      type: ChannelType.GuildVoice,
      parent: newState.channel.parentId,
      permissionOverwrites: [
        {
          id: newState.member.id,
          allow: [
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.MuteMembers,
            PermissionsBitField.Flags.DeafenMembers
          ]
        },
        {
          id: guild.roles.everyone.id,
          allow: [PermissionsBitField.Flags.Connect]
        }
      ]
    });

    // Створюємо текстовий канал у тій самій категорії
    const newTextChannel = await guild.channels.create({
      name: `${newState.member.user.username}-commands`,
      type: ChannelType.GuildText,
      parent: newVoiceChannel.parentId,
      permissionOverwrites: [
        {
          id: newState.member.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        },
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    // Переміщуємо користувача до нового голосового каналу
    await newState.member.voice.setChannel(newVoiceChannel);

    // Надсилаємо повідомлення з командами в текстовий канал
    await newTextChannel.send(`Привіт, ${newState.member.user.username}! Ваш канал створено. Ось команди, які ви можете використовувати:

**/rename <нова назва>** - змінити назву каналу
**/limit <кількість>** - встановити ліміт користувачів
**/lock** - закрити доступ до каналу
**/unlock** - відкрити доступ до каналу

Використовуйте ці команди, щоб налаштувати ваш голосовий канал.`);

    console.log(`Created voice and text channels for ${newState.member.user.tag}`);

    // Відстежуємо вихід користувача з голосового каналу
    const interval = setInterval(async () => {
      const updatedChannel = await guild.channels.fetch(newVoiceChannel.id);
      if (updatedChannel.members.size === 0) {
        clearInterval(interval);
        await newVoiceChannel.delete();
        await newTextChannel.delete();
        console.log(`Deleted channels for ${newState.member.user.tag}`);
      }
    }, 5000);
  }
});

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('/rename')) {
    const newName = message.content.split(' ').slice(1).join(' ');
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply('Ви повинні бути в голосовому каналі, щоб перейменувати його.');
    }

    if (voiceChannel.permissionsFor(message.member).has(PermissionsBitField.Flags.ManageChannels)) {
      await voiceChannel.setName(newName);
      message.reply(`Канал перейменовано на: ${newName}`);
    } else {
      message.reply('У вас немає прав на керування цим каналом.');
    }
  }

  if (message.content.startsWith('/limit')) {
    const limit = parseInt(message.content.split(' ')[1], 10);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply('Ви повинні бути в голосовому каналі, щоб встановити ліміт.');
    }

    if (voiceChannel.permissionsFor(message.member).has(PermissionsBitField.Flags.ManageChannels)) {
      await voiceChannel.setUserLimit(limit);
      message.reply(`Ліміт користувачів у каналі встановлено на: ${limit}`);
    } else {
      message.reply('У вас немає прав на керування цим каналом.');
    }
  }

  if (message.content.startsWith('/lock')) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply('Ви повинні бути в голосовому каналі, щоб заблокувати його.');
    }

    if (voiceChannel.permissionsFor(message.member).has(PermissionsBitField.Flags.ManageChannels)) {
      await voiceChannel.permissionOverwrites.edit(message.guild.roles.everyone, {
        Connect: false
      });
      message.reply('Канал заблоковано.');
    } else {
      message.reply('У вас немає прав на керування цим каналом.');
    }
  }

  if (message.content.startsWith('/unlock')) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply('Ви повинні бути в голосовому каналі, щоб розблокувати його.');
    }

    if (voiceChannel.permissionsFor(message.member).has(PermissionsBitField.Flags.ManageChannels)) {
      await voiceChannel.permissionOverwrites.edit(message.guild.roles.everyone, {
        Connect: true
      });
      message.reply('Канал розблоковано.');
    } else {
      message.reply('У вас немає прав на керування цим каналом.');
    }
  }
});

// Function to send a message to the Discord channel
async function sendMessageToChannel(username) {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await guild.channels.fetch(CHANNEL_ID);

    if (channel && channel.isTextBased()) {
      await channel.send(`🎉 Фрік дня: **${username}**! Вітаємо, єбать ти фрікаделька!🚷`);
      console.log('Message sent');
    } else {
      console.error('Channel not found or is not text-based.');
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Save message statistics to Supabase
async function saveMessageStat(userId, username, avatar, date) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  if (data.length === 0) {
    await supabase.from('user_stats').insert([
      { user_id: userId, username, avatar, date, message_count: 1 }
    ]);
  } else {
    await supabase
      .from('user_stats')
      .update({ message_count: data[0].message_count + 1 })
      .eq('user_id', userId)
      .eq('date', date);
  }
}

// Handle message creation
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const username = message.author.username;
  const avatar = message.author.displayAvatarURL();
  const date = new Date().toISOString().split('T')[0];

  saveMessageStat(userId, username, avatar, date);
});

// API to get user statistics
app.get('/api/user-stats', async (req, res) => {
  const { data, error } = await supabase.from('user_stats').select('*');
  if (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).send('Server error.');
  }
  res.status(200).json(data);
});

// Save reaction statistics to Supabase
async function saveReactionStat(reactionKey, name, imageUrl) {
  const { data, error } = await supabase
    .from('reactions_stats')
    .select('*')
    .eq('reaction_key', reactionKey);

  if (data.length === 0) {
    await supabase.from('reactions_stats').insert([
      { reaction_key: reactionKey, name, image_url: imageUrl, count: 1 }
    ]);
  } else {
    await supabase
      .from('reactions_stats')
      .update({ count: data[0].count + 1 })
      .eq('reaction_key', reactionKey);
  }
}

// Handle reaction addition
client.on('messageReactionAdd', (reaction) => {
  const emoji = reaction.emoji;
  const reactionKey = emoji.id ? `${emoji.name}:${emoji.id}` : emoji.name;
  saveReactionStat(reactionKey, emoji.name, emoji.url || emoji.toString());
});

// API to get reaction statistics
app.get('/api/reactions-stats', async (req, res) => {
  const { data, error } = await supabase.from('reactions_stats').select('*');
  if (error) {
    console.error('Error fetching reactions stats:', error);
    return res.status(500).send('Server error.');
  }
  res.status(200).json(data);
});

// API to get members of the server
app.get('/api/members', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const members = await guild.members.fetch();

    const filteredMembers = members.filter(member => !member.user.bot);
    const membersData = filteredMembers.map(member => ({
      id: member.id,
      username: member.user.username,
      avatar: member.user.displayAvatarURL(),
      roles: member.roles.cache.map(role => role.name)
    }));

    res.status(200).json(membersData);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).send('Server error.');
  }
});

// Handle message create with keyword check
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().includes('фрік') ||
      message.content.toLowerCase().includes('fr1kadelka') ||
      message.content.toLowerCase().includes('даун')) {
    try {
      // Отримуємо останнього переможця фріка дня з бази даних
      const { data: lastWinner, error } = await supabase
        .from('freak_winners')
        .select('username')
        .order('win_count', { ascending: false })
        .limit(1)
        .single();

      if (error || !lastWinner) {
        console.error('Error fetching last winner:', error);
        message.reply('Не вдалося отримати останнього фріка дня.');
      } else {
        message.react('🤡');
        message.reply(`Може таки тегним головного по фріковству ${lastWinner.username} 🤡🤡🤡🤡?`);
      }
    } catch (err) {
      console.error('Error handling messageCreate event:', err);
      message.reply('Сталася помилка під час обробки вашого запиту.');
    }
  }
});

// API to add a winner
app.post('/api/add-winner', async (req, res) => {
  const { userId, username } = req.body;

  if (!userId || !username) {
    return res.status(400).send('Insufficient data.');
  }

  const { data, error } = await supabase
    .from('freak_winners')
    .select('*')
    .eq('user_id', userId);

  if (data.length === 0) {
    await supabase.from('freak_winners').insert([
      { user_id: userId, username, win_count: 1 }
    ]);
  } else {
    await supabase
      .from('freak_winners')
      .update({ win_count: data[0].win_count + 1 })
      .eq('user_id', userId);
  }

  res.status(200).send('Winner added to the statistics.');
});

// API to get winners statistics
app.get('/api/freak-stats', async (req, res) => {
  const { data, error } = await supabase.from('freak_winners').select('*');
  if (error) {
    console.error('Error fetching freak stats:', error);
    return res.status(500).send('Server error.');
  }
  res.status(200).json(data);
});

// API to trigger roulette
app.post('/api/roulette', async (req, res) => {
  try {
    const { winner } = req.body;

    if (!winner || !winner.username) {
      return res.status(400).send('Insufficient data to send message.');
    }

    await sendMessageToChannel(winner.username);

    const { error } = await supabase.from('roulette_logs').insert([
      { user_id: winner.id, username: winner.username, date: new Date().toISOString() }
    ]);

    if (error) {
      console.error('Error saving roulette log:', error);
      return res.status(500).send('Error logging the roulette event.');
    }

    res.status(200).send('Message sent and logged successfully.');
  } catch (error) {
    console.error('Error triggering roulette:', error);
    res.status(500).send('Server error.');
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
