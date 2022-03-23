import { Bot } from '../../classes';

/**
 * Returns all users if id is in passed array
 *
 * @export
 * @param {Bot} client
 * @param {string[]} ids
 */
export async function getAllUsersByIDs({ client, ids }: { client: Bot; ids: string[] }) {
    return await client.db.users.findMany({
        where: {
            id: {
                in: ids,
            },
        },
    });
}
