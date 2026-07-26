CREATE TABLE `user_media` (
	`id` varchar(64) NOT NULL,
	`user_id` int NOT NULL,
	`mime_type` varchar(255) NOT NULL,
	`data` mediumblob NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `otp_tokens` MODIFY COLUMN `token` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `occupation` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_decoration_url` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_decoration_hue` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_shape` enum('square','soft','rounded','circle') DEFAULT 'rounded';--> statement-breakpoint
ALTER TABLE `users` ADD `banner_image_url` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `banner_background_url` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `profile_bg_color` varchar(7) DEFAULT '#050505';--> statement-breakpoint
ALTER TABLE `users` ADD `profile_bg_opacity` int DEFAULT 100;--> statement-breakpoint
ALTER TABLE `users` ADD `profile_border_color` varchar(7) DEFAULT '#ffffff';--> statement-breakpoint
ALTER TABLE `users` ADD `profile_border_width` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `profile_border_radius` int DEFAULT 24;--> statement-breakpoint
ALTER TABLE `users` ADD `profile_card_blur` int DEFAULT 4;--> statement-breakpoint
ALTER TABLE `users` ADD `profile_background_blur` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `profile_shadow_color` varchar(7) DEFAULT '#000000';--> statement-breakpoint
ALTER TABLE `users` ADD `profile_shadow_opacity` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `profile_opacity` int DEFAULT 100;--> statement-breakpoint
ALTER TABLE `user_media` ADD CONSTRAINT `user_media_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;