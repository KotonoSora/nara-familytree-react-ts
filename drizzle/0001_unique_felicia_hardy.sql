CREATE TABLE `people` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`middle_name` text,
	`gender` text,
	`birth_date` text,
	`death_date` text,
	`birth_place` text,
	`bio` text,
	`profile_image` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `relationships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parent_id` integer NOT NULL,
	`child_id` integer NOT NULL,
	`relationship_type` text DEFAULT 'biological',
	`created_at` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`child_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
