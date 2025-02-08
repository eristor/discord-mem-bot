import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

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
    GatewayIntentBits.GuildMessageReactions
  ]
});

const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PORT = process.env.PORT || 3000;

client.login(process.env.DISCORD_TOKEN);

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
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
      role: member.roles.highest.name
    }));

    res.status(200).json(membersData);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).send('Server error.');
  }
});

// Handle message create with keyword check
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().includes('фрік') ||
      message.content.toLowerCase().includes('fr1kadelka') ||
      message.content.toLowerCase().includes('даун')) {
    message.react('🤡');
    message.reply('Може таки тегним головного по фріковсту fr1kadelka🤡🤡🤡🤡?');
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
