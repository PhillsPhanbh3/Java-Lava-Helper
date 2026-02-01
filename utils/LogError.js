const { EmbedBuilder } = require('discord.js');

async function LogError(error, client, context = 'Unknown Context') {
    const errorChannelId = '1400215542991687722';
    
    if (!errorChannelId) {
        console.error('No error channel ID configured!');
        return;
    }

    const errorChannel = await client.channels.fetch(errorChannelId).catch(() => null);
    
    if (!errorChannel) {
        console.error('Could not fetch error logging channel!');
        return;
    }

    const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('⚠️ Error Detected ⚠️')
        .setDescription(`\`\`\`js\n${error.stack || error}\n\`\`\``)
        .addFields(
            { name: 'Context', value: context },
            { name: 'Timestamp', value: new Date().toISOString() },
            { name: 'Client User', value: `<@${client.user.id}>` }
        )
        .setTimestamp();

    try {
        await errorChannel.send({ embeds: [errorEmbed] });
    } catch (sendError) {
        console.error('Failed to send error to logging channel:', sendError);
    }
}

module.exports = { LogError };