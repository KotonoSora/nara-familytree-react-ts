CREATE TABLE `family_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`middle_name` text,
	`maiden_name` text,
	`birth_date` text,
	`death_date` text,
	`gender` text NOT NULL,
	`birth_place` text,
	`death_place` text,
	`occupation` text,
	`biography` text,
	`photo_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `family_relationships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`person1_id` integer NOT NULL,
	`person2_id` integer NOT NULL,
	`relationship_type` text NOT NULL,
	`start_date` text,
	`end_date` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`person1_id`) REFERENCES `family_members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`person2_id`) REFERENCES `family_members`(`id`) ON UPDATE no action ON DELETE cascade
);
