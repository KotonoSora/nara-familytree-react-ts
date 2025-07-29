CREATE TABLE `family_trees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`canvas_width` real DEFAULT 2000,
	`canvas_height` real DEFAULT 1500,
	`canvas_background_color` text DEFAULT '#f8f9fa',
	`canvas_background_image` text,
	`default_zoom` real DEFAULT 1,
	`default_center_x` real DEFAULT 1000,
	`default_center_y` real DEFAULT 750,
	`is_public` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`middle_name` text,
	`nickname` text,
	`birth_date` text,
	`birth_place` text,
	`death_date` text,
	`death_place` text,
	`gender` text,
	`photo` text,
	`notes` text,
	`canvas_x` real DEFAULT 0,
	`canvas_y` real DEFAULT 0,
	`canvas_width` real DEFAULT 150,
	`canvas_height` real DEFAULT 100,
	`canvas_color` text DEFAULT '#ffffff',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `relationships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`person1_id` integer NOT NULL,
	`person2_id` integer NOT NULL,
	`relationship_type` text NOT NULL,
	`start_date` text,
	`end_date` text,
	`notes` text,
	`connection_style` text DEFAULT 'curved',
	`connection_color` text DEFAULT '#333333',
	`connection_width` real DEFAULT 2,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`person1_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`person2_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tree_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tree_id` integer NOT NULL,
	`person_id` integer NOT NULL,
	`tree_canvas_x` real,
	`tree_canvas_y` real,
	`tree_canvas_width` real,
	`tree_canvas_height` real,
	`tree_canvas_color` text,
	`is_root_person` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tree_id`) REFERENCES `family_trees`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `demo`;