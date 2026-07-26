CREATE TABLE `affiliate_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`user_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliate_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `otp_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`token` varchar(8) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otp_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`token` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `profile_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`view_date` date NOT NULL,
	`count` int NOT NULL DEFAULT 1,
	CONSTRAINT `profile_views_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_date_idx` UNIQUE(`user_id`,`view_date`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(32) NOT NULL,
	`display_name` varchar(32),
	`location` varchar(50),
	`bio` varchar(1000),
	`email` varchar(255),
	`password` varchar(255),
	`ip` varchar(64),
	`role` enum('user','admin','moderator') NOT NULL DEFAULT 'user',
	`email_verified` boolean NOT NULL DEFAULT false,
	`discord_id` varchar(32),
	`discord_username` varchar(64),
	`views` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_discord_id_unique` UNIQUE(`discord_id`)
);
--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`token` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `verification_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `affiliate_codes` ADD CONSTRAINT `affiliate_codes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile_views` ADD CONSTRAINT `profile_views_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;