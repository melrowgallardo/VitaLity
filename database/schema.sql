-- ========================================================
-- Database Schema for Vitality: Daily Vitamin & Habit Tracker
-- ========================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `vitality_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `vitality_db`;

-- 2. Create `vitamins` Table
CREATE TABLE IF NOT EXISTS `vitamins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `is_completed` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Optional Indexes for Quick Filtering and Sorting
CREATE INDEX idx_vitamins_date_time ON `vitamins` (`date`, `time`);

-- 4. Sample Starter Seed Data (For easy immediate testing)
INSERT INTO `vitamins` (`name`, `date`, `time`, `is_completed`) VALUES
  ('Vitamin D3 (5000 IU)', CURDATE(), '08:00:00', FALSE),
  ('Omega-3 Fish Oil', CURDATE(), '08:30:00', TRUE),
  ('Multivitamin Complex', CURDATE(), '12:00:00', FALSE),
  ('Magnesium Glycinate (400mg)', CURDATE(), '21:00:00', FALSE),
  ('Probiotic Capsule', CURDATE(), '21:30:00', FALSE);

