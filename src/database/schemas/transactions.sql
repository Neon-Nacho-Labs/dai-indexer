CREATE TABLE `transactions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `hash` varchar(66) NOT NULL,
  `from_address` varchar(42) NOT NULL,
  `to_address` varchar(42) NOT NULL,
  `value` varchar(45) NOT NULL,
  `block_number` bigint unsigned NOT NULL,
  `inserted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hash_UNIQUE` (`hash`),
  KEY `index_from` (`from_address`),
  KEY `index_to` (`to_address`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=latin1