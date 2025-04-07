-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: adhd
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `addressID` int NOT NULL AUTO_INCREMENT,
  `rruga` varchar(255) NOT NULL,
  `qyteti` varchar(255) NOT NULL,
  `zipCode` varchar(255) NOT NULL,
  `shteti` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `addressUserID` int NOT NULL,
  PRIMARY KEY (`addressID`),
  KEY `addressUserID` (`addressUserID`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`addressUserID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,'muharrem fejza','prishtine','10000','kosove','2025-04-05 12:50:27','2025-04-05 12:50:27',1);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `categoryID` int NOT NULL AUTO_INCREMENT,
  `emri` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`categoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Lipstick','2025-04-05 13:09:14','2025-04-05 13:09:14');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderitems`
--

DROP TABLE IF EXISTS `orderitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitems` (
  `orderItemID` int NOT NULL AUTO_INCREMENT,
  `sasia` varchar(255) NOT NULL,
  `cmimi` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orderItemOrderID` int NOT NULL,
  `orderItemProductID` int NOT NULL,
  PRIMARY KEY (`orderItemID`),
  KEY `orderItemOrderID` (`orderItemOrderID`),
  KEY `orderItemProductID` (`orderItemProductID`),
  CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`orderItemOrderID`) REFERENCES `orders` (`orderID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orderitems_ibfk_2` FOREIGN KEY (`orderItemProductID`) REFERENCES `products` (`productID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitems`
--

LOCK TABLES `orderitems` WRITE;
/*!40000 ALTER TABLE `orderitems` DISABLE KEYS */;
INSERT INTO `orderitems` VALUES (1,'20','30$','2025-04-07 16:07:40','2025-04-07 16:07:40',1,1);
/*!40000 ALTER TABLE `orderitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `orderID` int NOT NULL AUTO_INCREMENT,
  `totalPrice` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orderUserID` int NOT NULL,
  PRIMARY KEY (`orderID`),
  KEY `orderUserID` (`orderUserID`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`orderUserID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'20$','delivered','2025-04-07 15:59:29','2025-04-07 15:59:29',1);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `paymentID` int NOT NULL AUTO_INCREMENT,
  `metoda` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `data` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `paymentOrderID` int NOT NULL,
  PRIMARY KEY (`paymentID`),
  KEY `paymentOrderID` (`paymentOrderID`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`paymentOrderID`) REFERENCES `orders` (`orderID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,'card','finished','25.06.2025','2025-04-07 16:44:51','2025-04-07 16:44:51',1);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `productID` int NOT NULL AUTO_INCREMENT,
  `emri` varchar(255) NOT NULL,
  `pershkrimi` varchar(255) NOT NULL,
  `firma` varchar(255) NOT NULL,
  `cmimi` varchar(255) NOT NULL,
  `imageURL` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `productCategoryID` int NOT NULL,
  PRIMARY KEY (`productID`),
  KEY `productCategoryID` (`productCategoryID`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`productCategoryID`) REFERENCES `categories` (`categoryID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'black honey','buzekuq','mac','20$','mac','2025-04-05 13:22:14','2025-04-05 13:22:14',1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `reviewID` int NOT NULL AUTO_INCREMENT,
  `rating` varchar(255) NOT NULL,
  `koment` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `reviewUserID` int NOT NULL,
  `reviewProductID` int NOT NULL,
  PRIMARY KEY (`reviewID`),
  KEY `reviewUserID` (`reviewUserID`),
  KEY `reviewProductID` (`reviewProductID`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`reviewUserID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewProductID`) REFERENCES `products` (`productID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,'5','i like it','2025-04-07 16:49:28','2025-04-07 16:49:28',1,1);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `emri` varchar(255) NOT NULL,
  `mbiemri` varchar(255) NOT NULL,
  `nrTel` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'arba','maxhuni','044726482','a@gmail.com','12345678','admin','2025-04-05 12:39:53','2025-04-05 12:39:53');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `wishlistID` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `wishlistUserID` int NOT NULL,
  `wishlistProductID` int NOT NULL,
  PRIMARY KEY (`wishlistID`),
  KEY `wishlistUserID` (`wishlistUserID`),
  KEY `wishlistProductID` (`wishlistProductID`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`wishlistUserID`) REFERENCES `users` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`wishlistProductID`) REFERENCES `products` (`productID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES (1,'2025-04-07 16:59:02','2025-04-07 16:59:02',1,1);
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-07 19:00:08
