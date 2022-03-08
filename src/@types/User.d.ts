import { FilterType } from '@prisma/client';

/**
 * Interface for user data stored
 */
export interface UserData {
    avatar: string;
    last_username: string;
    status: string;
    user_type: string;
    servers: string;
    roles?: string;
    reason: string;
    filter_type: FilterType;
}
