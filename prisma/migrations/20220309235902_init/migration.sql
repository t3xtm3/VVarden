-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `last_username` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NOT NULL,
    `status` ENUM('APPEALED', 'WHITELIST', 'BLACKLIST', 'PERM_BLACKLIST') NOT NULL,
    `user_type` VARCHAR(191) NOT NULL,
    `servers` LONGTEXT NOT NULL DEFAULT '',
    `roles` LONGTEXT NOT NULL DEFAULT '',
    `filter_type` ENUM('MANUAL', 'SEMI_AUTO', 'AUTO') NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `anonymized` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff` (
    `id` VARCHAR(191) NOT NULL,
    `admin` BOOLEAN NOT NULL DEFAULT false,
    `dev` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guild` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `logchan` VARCHAR(191) NOT NULL,
    `punown` ENUM('WARN', 'KICK', 'BAN') NOT NULL DEFAULT 'BAN',
    `punsupp` ENUM('WARN', 'KICK', 'BAN') NOT NULL DEFAULT 'KICK',
    `punleak` ENUM('WARN', 'KICK', 'BAN') NOT NULL DEFAULT 'KICK',
    `puncheat` ENUM('WARN', 'KICK', 'BAN') NOT NULL DEFAULT 'KICK',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `guild_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bad_servers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('CHEATING', 'LEAKING', 'RESELLING', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `addedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bad_servers_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
