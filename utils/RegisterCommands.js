const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    console.log('Started refreshing application (/) commands.');
    
    const commands = [];
    const devCommands = [];
    const commandNames = new Set();
    const commandsPath = path.join(__dirname, '..', 'commands');
    const devCommandsPath = path.join(commandsPath, 'dev');

    // Function to load commands including dev folder
    const loadCommands = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                loadCommands(fullPath); // Remove the dev folder check to traverse all directories
            } else if (file.name.endsWith('.js')) {
                const command = require(fullPath);
                const commandData = command.data?.toJSON();
                if (!commandData) {
                    console.warn(`[REGISTER] Skipping ${file.name}: No command data found.`);
                    continue;
                }
                commandData.dm_permission ??= false;
                
                if (commandNames.has(commandData.name)) continue;
                commandNames.add(commandData.name);
                
                // Check if command is in dev folder
                if (fullPath.includes(path.sep + 'dev' + path.sep)) {
                    devCommands.push(commandData);
                    console.log(`[REGISTER] Loaded dev command: ${commandData.name}`);
                } else {
                    commands.push(commandData);
                    console.log(`[REGISTER] Loaded global command: ${commandData.name}`);
                }
            }
        }
    };

    loadCommands(commandsPath);

    if (commands.length === 0) {
        console.warn('[REGISTER] No global commands were loaded!');
    }

    if (devCommands.length === 0) {
        console.warn(`[REGISTER] No dev commands were loaded from ${devCommandsPath}`);
    }

    if (devCommands.length > 0 && !client.config.DEV_GUILD_ID) { //checks for the dev guild
        console.warn('You have dev commands but no DEV_GUILD_ID in config.json - These will not be registered!');
    }

    const rest = new REST({ version: '10' }).setToken(client.config.TOKEN);
    try {
        // Register global commands
        await rest.put(
            Routes.applicationCommands(client.config.APP_ID),
            { body: commands },
        );
        console.info('Successfully registered global commands.');
        
        // register dev commands if a guild is valid
        if (typeof client.config.DEV_GUILD_ID === 'string') {
            await rest.put(
                Routes.applicationGuildCommands(client.config.APP_ID, client.config.DEV_GUILD_ID),
                { body: devCommands },
            );
            console.info('Successfully registered dev commands for the development guild.');
        }
    } catch (error) {
        console.error('Error registering commands:', error);
    }
};
