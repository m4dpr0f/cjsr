import { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import { storage } from './storage';
import { StatsService } from './stats-service';

export class CJSRDiscordBot {
  private client: Client;
  private isReady = false;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
      ],
    });

    this.setupEventHandlers();
    this.setupCommands();
  }

  private setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`🤖 CJSR Discord Bot ready! Logged in as ${this.client.user?.tag}`);
      console.log(`📊 Connected to ${this.client.guilds.cache.size} servers`);
      this.isReady = true;
    });

    this.client.on('guildCreate', async (guild) => {
      console.log(`🎉 Bot added to new server: ${guild.name} (${guild.id})`);
      await this.setupServerWelcome(guild);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const { commandName } = interaction;
      console.log(`🎮 Discord command received: ${commandName} from ${interaction.user.username}`);

      try {
        switch (commandName) {
          case 'link':
            await this.handleLinkCommand(interaction);
            break;
          case 'profile':
            await this.handleProfileCommand(interaction);
            break;
          case 'leaderboard':
            await this.handleLeaderboardCommand(interaction);
            break;
          case 'faction':
            await this.handleFactionCommand(interaction);
            break;
          case 'race':
            await this.handleRaceCommand(interaction);
            break;
          case 'stats':
            await this.handleStatsCommand(interaction);
            break;
          case 'cjsr':
            console.log('🔗 Processing cjsr command...');
            await this.handleInviteCommand(interaction);
            break;
          default:
            console.log(`❓ Unknown command: ${commandName}`);
            await interaction.reply({
              content: 'Unknown command. Try /invite to get started!',
              ephemeral: true
            });
        }
      } catch (error) {
        console.error('Discord command error:', error);
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              content: 'An error occurred while processing your command.',
              ephemeral: true,
            });
          } else {
            await interaction.followUp({
              content: 'An error occurred while processing your command.',
              ephemeral: true,
            });
          }
        } catch (replyError) {
          console.error('Failed to send error message:', replyError);
        }
      }
    });
  }

  private async setupCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Discord account to your CJSR profile')
        .addStringOption(option =>
          option.setName('username')
            .setDescription('Your CJSR username')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('password')
            .setDescription('Your CJSR password')
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName('profile')
        .setDescription('View your CJSR profile or another player\'s profile')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Discord user to view profile for (optional)')
            .setRequired(false)
        ),

      new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the top players leaderboard'),

      new SlashCommandBuilder()
        .setName('faction')
        .setDescription('View faction war standings'),

      new SlashCommandBuilder()
        .setName('race')
        .setDescription('Get information about current Matrix races'),

      new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View detailed statistics')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Discord user to view stats for (optional)')
            .setRequired(false)
        ),

      new SlashCommandBuilder()
        .setName('cjsr')
        .setDescription('Get the link to play Chicken Jockey Scribe Racer'),
    ];

    this.client.once('ready', async () => {
      try {
        console.log('🔄 Refreshing Discord application (/) commands...');
        
        if (!this.client.application) {
          console.error('❌ No application found on Discord client');
          return;
        }

        // Register commands globally
        const result = await this.client.application.commands.set(commands);
        console.log(`✅ Successfully registered ${result.size} Discord commands globally.`);
        
        // List registered commands for debugging
        const registeredCommands = await this.client.application.commands.fetch();
        console.log('📝 Registered commands:', registeredCommands.map(cmd => cmd.name).join(', '));
        
      } catch (error) {
        console.error('❌ Error reloading Discord commands:', error);
        console.error('Bot may need additional permissions:');
        console.error('- applications.commands scope');
        console.error('- bot scope');
        console.error('Current invite URL should include both scopes');
      }
    });
  }

  private async handleLinkCommand(interaction: any) {
    await interaction.deferReply({ flags: 64 });

    const username = interaction.options.getString('username');
    const password = interaction.options.getString('password');
    const discordId = interaction.user.id;

    try {
      // Verify CJSR credentials
      const user = await storage.getUserByUsername(username);
      if (!user) {
        await interaction.editReply('❌ CJSR username not found.');
        return;
      }

      // For this demo, we'll store Discord ID in the user's avatar_url field
      // In production, you'd want a proper discord_id field
      await storage.updateUserProfile(user.id, {
        avatar_url: `discord:${discordId}`,
      });

      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle('🔗 Account Linked Successfully!')
        .setDescription(`Your Discord account has been linked to CJSR profile: **${username}**`)
        .addFields(
          { name: 'Chicken Name', value: user.chicken_name || 'Not set', inline: true },
          { name: 'Total Races', value: user.total_races.toString(), inline: true },
          { name: 'Average WPM', value: user.avg_wpm.toString(), inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Link command error:', error);
      await interaction.editReply('❌ Failed to link account. Please check your credentials.');
    }
  }

  private async handleProfileCommand(interaction: any) {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user') || interaction.user;
    const discordId = targetUser.id;

    try {
      // Find CJSR user by Discord ID
      const users = await storage.getAllUsers();
      const cjsrUser = users.find(u => u.avatar_url === `discord:${discordId}`);

      if (!cjsrUser) {
        await interaction.editReply(
          `❌ ${targetUser.username} hasn't linked their CJSR account yet. Use \`/link\` to connect your account!`
        );
        return;
      }

      const playerStats = await StatsService.getPlayerStats(cjsrUser.id);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`🐔 ${cjsrUser.chicken_name || cjsrUser.username}'s Profile`)
        .setDescription(`CJSR Player Profile for ${targetUser.username}`)
        .addFields(
          { name: '🏆 Total Races', value: cjsrUser.total_races.toString(), inline: true },
          { name: '🥇 Races Won', value: cjsrUser.races_won.toString(), inline: true },
          { name: '⚡ Average WPM', value: cjsrUser.avg_wpm.toString(), inline: true },
          { name: '💎 Total XP', value: cjsrUser.xp.toLocaleString(), inline: true },
          { name: '🎯 Faction', value: playerStats?.stats?.current_faction || 'None', inline: true },
          { name: '📈 Win Rate', value: `${((cjsrUser.races_won / Math.max(cjsrUser.total_races, 1)) * 100).toFixed(1)}%`, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Profile command error:', error);
      await interaction.editReply('❌ Failed to fetch profile data.');
    }
  }

  private async handleLeaderboardCommand(interaction: any) {
    await interaction.deferReply();

    try {
      const leaderboard = await storage.getLeaderboard();
      const topPlayers = leaderboard.leaderboard.slice(0, 10);

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🏆 CJSR Top Players Leaderboard')
        .setDescription('Top 10 players by average WPM')
        .setTimestamp();

      let description = '';
      
      for (let i = 0; i < topPlayers.length; i++) {
        const player = topPlayers[i];
        const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}.`;
        
        // Get player's faction and additional stats
        const factionXp = typeof player.faction_xp === 'string' ? 
          JSON.parse(player.faction_xp || '{}') : (player.faction_xp || {});
        const currentFaction = player.current_faction || 'd4';
        const factionName = {
          'd2': 'Coin', 'd4': 'Fire', 'd6': 'Earth', 'd8': 'Air',
          'd10': 'Chaos', 'd12': 'Ether', 'd20': 'Water', 'd100': 'Order'
        }[currentFaction] || 'Fire';
        
        // Calculate accuracy (default to 85% if not available)
        const accuracy = player.accuracy || 85;
        
        description += `${medal} **${player.username}** | Mount: ${player.chicken_name || 'Unnamed'}\n`;
        description += `    💨 ${player.avg_wpm} WPM | 🎯 ${accuracy}% | 💎 ${player.xp.toLocaleString()} XP | ⚔️ ${factionName}\n\n`;
      }

      embed.setDescription(description);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Leaderboard command error:', error);
      await interaction.editReply('❌ Failed to fetch leaderboard data.');
    }
  }

  private async handleFactionCommand(interaction: any) {
    await interaction.deferReply();

    try {
      const factionStats = await StatsService.getFactionStats();
      const topFactions = factionStats.slice(0, 8);

      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle('⚔️ Faction War Standings')
        .setDescription('Current faction rankings by total XP')
        .setTimestamp();

      let description = '';
      topFactions.forEach((faction, index) => {
        const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
        description += `${medal} **${faction.name}** - ${faction.totalXp.toLocaleString()} XP (${faction.playerCount} members)\n`;
        if (faction.topPlayer) {
          description += `   └ Top: ${faction.topPlayer} (${faction.topPlayerMount || 'No mount'})\n`;
        }
      });

      embed.setDescription(description);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Faction command error:', error);
      await interaction.editReply('❌ Failed to fetch faction data.');
    }
  }

  private async handleRaceCommand(interaction: any) {
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🏁 Join CJSR Races Now!')
      .setDescription('Multiple ways to join the typing racing action')
      .addFields(
        { name: '🚀 Quick Race', value: 'Visit **[chickenjockeyracer.replit.app](https://chickenjockeyracer.replit.app)** and click "JOIN QUICK RACE" for instant action with NPCs and players', inline: false },
        { name: '👥 Multiplayer Only', value: 'Join pure player vs player races - no NPCs, just human competition', inline: true },
        { name: '🤖 NPC Training', value: 'Practice against AI opponents with Easy or Hard difficulty settings', inline: true },
        { name: '📖 Campaign Mode', value: 'Experience story-driven single-player adventures with character progression', inline: true },
        { name: '🏛️ Faction Wars', value: 'Compete for your faction (D2, D4, D6, D8, D10, D12, D20, D100) and earn XP rewards', inline: false }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  private async handleStatsCommand(interaction: any) {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user') || interaction.user;
    const discordId = targetUser.id;

    try {
      // Find CJSR user by Discord ID
      const users = await storage.getAllUsers();
      const cjsrUser = users.find(u => u.avatar_url === `discord:${discordId}`);

      if (!cjsrUser) {
        await interaction.editReply(
          `❌ ${targetUser.username} hasn't linked their CJSR account yet. Use \`/link\` to connect your account!`
        );
        return;
      }

      const playerStats = await StatsService.getPlayerStats(cjsrUser.id);
      const factionXp = playerStats?.stats?.faction_xp as any || {};

      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle(`📊 Detailed Stats for ${cjsrUser.chicken_name || cjsrUser.username}`)
        .setDescription(`Complete statistics for ${targetUser.username}`)
        .addFields(
          { name: '🏁 Racing Stats', value: `Races: ${cjsrUser.total_races}\nWins: ${cjsrUser.races_won}\nWin Rate: ${((cjsrUser.races_won / Math.max(cjsrUser.total_races, 1)) * 100).toFixed(1)}%`, inline: true },
          { name: '⚡ Performance', value: `Avg WPM: ${cjsrUser.avg_wpm}\nTop WPM: ${playerStats?.stats?.top_wpm || 'N/A'}\nAccuracy: ${playerStats?.stats?.top_accuracy || 'N/A'}%`, inline: true },
          { name: '💎 Experience', value: `Total XP: ${cjsrUser.xp.toLocaleString()}\nFaction: ${playerStats?.stats?.current_faction || 'None'}`, inline: true },
          { name: '🎲 Faction XP Breakdown', value: `d2: ${factionXp.d2 || 0}\nd4: ${factionXp.d4 || 0}\nd6: ${factionXp.d6 || 0}\nd8: ${factionXp.d8 || 0}`, inline: true },
          { name: '🎯 More Faction XP', value: `d10: ${factionXp.d10 || 0}\nd12: ${factionXp.d12 || 0}\nd20: ${factionXp.d20 || 0}\nd100: ${factionXp.d100 || 0}`, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Stats command error:', error);
      await interaction.editReply('❌ Failed to fetch detailed statistics.');
    }
  }

  private async handleInviteCommand(interaction: any) {
    console.log('🔗 Invite command handler called');
    try {
      await interaction.deferReply();
      console.log('🔗 Reply deferred, building embed...');

      const embed = new EmbedBuilder()
        .setColor(0xF9BE2A)
        .setTitle('🐔 Chicken Jockey Scribe Racer')
        .setDescription('**The ultimate typing racing game with mystical Garu companions!**')
        .addFields(
          { name: '🏎️ Fast-Paced Racing', value: 'Race against players worldwide with Art of War passages', inline: true },
          { name: '🏛️ 8 Elemental Factions', value: 'Join D2-D100 factions and compete for XP rewards', inline: true },
          { name: '📚 Learn to Type Adventure', value: '12-chapter journey through 12 sacred languages', inline: true },
          { name: '🎮 Multiple Game Modes', value: 'Matrix races, campaign modes, and wisdom challenges', inline: true },
          { name: '🤖 Discord Integration', value: 'This bot shares race results and achievements automatically!', inline: true },
          { name: '🔗 Play Now', value: `**[🚀 Launch CJSR Game](${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'https://chickenjockeyracer.replit.app'})**\n\n**[📲 Add Bot to Your Server](https://discord.com/oauth2/authorize?client_id=1377550334389391390&permissions=2048&scope=bot%20applications.commands)**`, inline: false }
        )
        .setFooter({ text: 'Free to play • No downloads • Matrix federation enabled' });

      // Add share buttons as components
      const shareText = `🐔 Just discovered Chicken Jockey Scribe Racer - an epic typing racing game with mystical Garu companions! Race through sacred texts and compete across 8 elemental factions. Join me at: ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'https://chickenjockeyracer.replit.app'}`;
      
      embed.addFields({
        name: '📢 Share with Friends',
        value: `Copy this message to share:\n\`\`\`${shareText}\`\`\``,
        inline: false
      });

      console.log('🔗 Sending embed response...');
      await interaction.editReply({ embeds: [embed] });
      console.log('✅ Invite command completed successfully');
    } catch (error) {
      console.error('❌ Invite command error:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "An error occurred while generating the invite.",
            ephemeral: true
          });
        } else {
          await interaction.editReply({
            content: "An error occurred while generating the invite.",
          });
        }
      } catch (replyError) {
        console.error('Failed to send error response:', replyError);
      }
    }
  }

  public async start() {
    if (!process.env.DISCORD_BOT_TOKEN) {
      console.log('⚠️ Discord bot token not provided - bot disabled');
      return;
    }

    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
      console.error('❌ Failed to start Discord bot:', error);
    }
  }

  public async stop() {
    if (this.isReady) {
      await this.client.destroy();
      this.isReady = false;
    }
  }

  public getClient() {
    return this.client;
  }

  private async setupServerWelcome(guild: any) {
    try {
      // Find a suitable channel to post welcome message
      const systemChannel = guild.systemChannel;
      const generalChannel = guild.channels.cache.find((ch: any) => 
        ch.name.includes('general') && ch.type === ChannelType.GuildText
      );
      const firstTextChannel = guild.channels.cache.find((ch: any) => 
        ch.type === ChannelType.GuildText
      );
      
      const targetChannel = systemChannel || generalChannel || firstTextChannel;
      
      if (targetChannel) {
        const embed = new EmbedBuilder()
          .setColor(0x00AE86)
          .setTitle('🐔 Welcome to Chicken Jockey Scribe Racer!')
          .setDescription('Thanks for adding CJSR to your server! Here\'s what you can do:')
          .addFields(
            { name: '🔗 Get Started', value: 'Use `/link` to connect your CJSR account', inline: false },
            { name: '🏁 Commands', value: '`/race` - Join Matrix races\n`/profile` - View your stats\n`/leaderboard` - See top players\n`/faction` - Check faction standings', inline: false },
            { name: '🌐 Play Online', value: 'Visit the web app to create your account and customize your racer!', inline: false }
          )
          .setFooter({ text: 'Type faster, race smarter!' })
          .setTimestamp();

        await targetChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error(`Failed to send welcome message to ${guild.name}:`, error);
    }
  }

  // Moderation features
  public async sendRaceResults(results: any[]) {
    if (!this.isReady || !process.env.DISCORD_CHANNEL_ID) return;

    try {
      const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
      if (!channel || channel.type !== ChannelType.GuildText) return;

      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle('🏁 Matrix Race Results')
        .setDescription('Latest race results from the Matrix Federation!')
        .setTimestamp();

      let description = '';
      results.forEach((result, index) => {
        const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
        description += `${medal} **${result.playerName}** - ${result.wpm} WPM (${result.accuracy}% accuracy)\n`;
      });

      embed.setDescription(description);
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send race results to Discord:', error);
    }
  }
}

// Export singleton instance
export const cjsrBot = new CJSRDiscordBot();