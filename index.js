const { Client, PermissionsBitField, Events } = require('discord.js');
const mongoose = require('mongoose');
const LogError = require('./utils/LogError.js');
const client = new Client({ intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'DirectMessages']});
client.config = require('./config.json');
client.cooldowns = new Map();
client.cache = new Map();
require('./utils/ComponentLoader.js')(client);
require('./utils/EventLoader.js')(client);
require('./utils/RegisterCommands.js')(client);

( async function() {
	if (!client.config.mongoURL) return console.warn('MongoDB URL is not provided in the config.json file, skipping database connection...');
	await mongoose.connect(client.config.mongoURL);
})();

console.log(`Logging in...`);
client.login(client.config.TOKEN);
client.on('clientReady', function () {
    console.log(`Logged in as ${client.user.tag}!`);

	require('./utils/CheckIntents.js')(client);
});

client.on('messageCreate', () => {} )

async function InteractionHandler(interaction, type) {

    const component = client[type].get(interaction.customId ?? interaction.commandName);
    if (!component) return;
    const devs = [
        '1163939796767473698'
    ];
    try {
        console.log(`[INTERACTION] ${interaction.user.tag} in ${interaction.guild ? interaction.guild.name : 'DMs'} triggered ${type} ${interaction.customId ?? interaction.commandName}`);
        if (component.admin) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `⚠️ Only administrators can use this command!`, flags: 64 });
        } if (component.owner) {
            if (interaction.user.id !== '1163939796767473698') return await interaction.reply({ content: `⚠️ Only bot owners can use this command!`, flags: 64 });
        }
        await component.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.deferReply({ flags: 64 }).catch( () => {} );
        await interaction.editReply({
            content: `There was an error while executing this command!\n\`\`\`${error}\`\`\``,
            embeds: [],
            components: [],
            files: []
        }).catch( () => {} );
        LogError(error, client, `${type} ${interaction.customId ?? interaction.commandName}`);
    }
}

client.on('interactionCreate', async function(interaction) {
    if (!interaction.isChatInputCommand()) return;
    await InteractionHandler(interaction, 'commands');
});

client.on('interactionCreate', async function(interaction) {
    if (!interaction.isButton()) return;
    await InteractionHandler(interaction, 'buttons');
});

client.on('interactionCreate', async function(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    await InteractionHandler(interaction, 'dropdowns');
});

client.on('interactionCreate', async function(interaction) {
    if (!interaction.isModalSubmit()) return;
    await InteractionHandler(interaction, 'modals');
});