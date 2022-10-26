CREATE TABLE `dai_event_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `from_address` varchar(42) NOT NULL,
  `to_address` varchar(42) NOT NULL,
  `raw_value` varchar(45) NOT NULL,
  `value` varchar(45) NOT NULL,
  `transaction_hash` varchar(66) NOT NULL,
  `event_signature` varchar(66) NOT NULL,
  `event_name` varchar(45) NOT NULL,
  `inserted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `index_from` (`from_address`),
  KEY `index_to` (`to_address`),
  KEY `index_event_name` (`event_name`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=latin1