const { ActivityType } = require('discord.js');
const mongoose = require('mongoose');

const mongoURL = process.env.mongoURL;

const statuses = [
    { name: 'Java Lava', type: ActivityType.Watching }
];

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} is online!`);

        // Connect to MongoDB (optional, if used in your project)
        if (mongoURL) {
            try {
                await mongoose.connect(mongoURL, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                console.log('✅ Connected to MongoDB');
            } catch (err) {
                console.error('❌ MongoDB connection error:', err);
            }
        }

        // Initial bot status
        let i = 0;
        client.user.setActivity({
            name: statuses[i].name,
            type: statuses[i].type,
            url: statuses[i].url
        });

        // Rotate status every 10 seconds
        setInterval(() => {
            i = (i + 1) % statuses.length;
            client.user.setActivity({
                name: statuses[i].name,
                type: statuses[i].type,
                url: statuses[i].url
            });
        }, 10000);
    },
};
