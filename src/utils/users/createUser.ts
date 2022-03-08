import { UserData } from '../../@types';
import { Bot } from '../../classes';

/**
 * Create a user
 *
 * @export
 * @param {Bot} client
 * @param {Snowflake} id
 * @param {UserData} info
 */
export async function createUser({ client, id, info }: { client: Bot; id: string; info: UserData }) {
    const data = { id, ...info };
    return await client.db.users.create({
        data: data,
    });
}
