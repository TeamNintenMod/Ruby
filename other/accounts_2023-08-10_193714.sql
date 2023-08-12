-- MySQL dump 10.13  Distrib 8.1.0, for macos13 (x86_64)
--
-- Host: 127.0.0.1    Database: accounts
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `create_time` datetime DEFAULT NULL COMMENT 'Create Time',
  `nnid` varchar(32) DEFAULT NULL,
  `password` varchar(25) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `admin` tinyint(1) DEFAULT NULL,
  `miiUrl` json DEFAULT NULL,
  `miiHash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `community`
--

DROP TABLE IF EXISTS `community`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community` (
  `olive_community_id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `community_id` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `icon` varchar(10000) DEFAULT NULL,
  `icon_3ds` varchar(1000) DEFAULT NULL,
  `pid` varchar(255) DEFAULT NULL,
  `app_data` varchar(1000) DEFAULT NULL,
  `is_user_community` int DEFAULT NULL,
  PRIMARY KEY (`olive_community_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post` (
  `body` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `community_id` int DEFAULT NULL,
  `country_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL COMMENT 'Create Time',
  `feeling_id` int DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `is_autopost` int DEFAULT NULL,
  `is_community_private_autopost` int DEFAULT NULL,
  `is_spoiler` int DEFAULT NULL,
  `is_app_jumpable` int DEFAULT NULL,
  `empathy_count` int DEFAULT NULL,
  `language_id` int DEFAULT NULL,
  `mii` varchar(255) DEFAULT NULL,
  `mii_face_url` varchar(400) DEFAULT NULL,
  `number` int DEFAULT NULL,
  `painting` json DEFAULT NULL,
  `pid` int DEFAULT NULL,
  `platform_id` int DEFAULT NULL,
  `region_id` int DEFAULT NULL,
  `reply_count` int DEFAULT NULL,
  `screen_name` varchar(255) DEFAULT NULL,
  `title_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'accounts'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-08-10 19:37:25
