import { Bot } from '../classes/Bot';
import data from '../config.json';

export default async function (client: Bot) {
    client.logger.info('Bot is ready!');

    const arr = client.commands.map(c => c);
    const devCmds = client.commands.filter(c => c.roles.includes('dev')).map(c => c);
    const adminCmds = client.commands.filter(c => c.roles.includes('admin')).map(c => c);
    const combined = [...devCmds, ...adminCmds];
    const usercmds = arr.filter(c => !c.roles);

    client.application.commands.set([]);

    client.application.commands
        .set(usercmds)
        .then(() => client.logger.info('Successfully set user commands'));

    const mainGuild = await client.guilds.fetch(data.MAIN_GUILD);
    mainGuild.commands.set(combined).then(cmd => {
        const getStaffRole = (commandName: string) => {
            const permissions = combined.find(x => x.name === commandName).roles;

            if (!permissions) return null;

            const roles: string[] = [];
            if (permissions.includes('dev')) roles.push('959455940103512164');
            if (permissions.includes('admin')) roles.push('959461652758167553');

            return mainGuild.roles.cache.filter(x => roles.includes(x.id));
        };

        const fullPermissions = cmd.reduce((a, x) => {
            const staffRoles = getStaffRole(x.name);
            if (!staffRoles) return a;

            const permissions = staffRoles.reduce((a, v) => {
                return [
                    ...a,
                    {
                        id: v.id,
                        type: 'ROLE',
                        permission: true,
                    },
                ];
            }, []);

            return [
                ...a,
                {
                    id: x.id,
                    permissions,
                },
            ];
        }, []);

        mainGuild.commands.permissions
            .set({ fullPermissions })
            .then(() => client.logger.info('Successfully set staff and dev commands'));
    });

    // client.application.commands
    //     .set(arr)
    //     .then(() => client.logger.info('Loaded application commands successfully'))
    //     .catch(e => console.log(e));
}
