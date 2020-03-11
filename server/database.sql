DROP DATABASE IF EXISTS groupbuy;
CREATE DATABASE groupbuy;
USE groupbuy;

CREATE TABLE products(
	productID VARCHAR(35) PRIMARY KEY,
	requiredGroup INT,
	price DECIMAL(13,2)
);

CREATE TABLE groups(
  groupID VARCHAR(35) NOT NULL PRIMARY KEY,
  productID VARCHAR(35),
  FOREIGN KEY (productID) REFERENCES products(productID)
);

CREATE TABLE orders(
	orderID VARCHAR(35) NOT NULL PRIMARY KEY,
	productID VARCHAR(35) NOT NULL,
	platformID VARCHAR(35) NOT NULL,
  userID VARCHAR(35) NOT NULL,
	address VARCHAR(200) NOT NULL,
	orderTime BIGINT NOT NULL,
  groupID VARCHAR(35),
	FOREIGN KEY (productID) REFERENCES products(productID),
  FOREIGN KEY (groupID) REFERENCES groups(groupID) ON DELETE CASCADE
);

INSERT INTO products VALUES ("12345",5,99.85);
INSERT INTO products VALUES ("67890",5,65.32);
INSERT INTO products VALUES ("54321",5,105.99);

INSERT INTO orders VALUES ("order1","12345","amazon_gb","user1","FAKE ADDRESS","1583777588491",null);
INSERT INTO orders VALUES ("order2","12345","ebay_gb","user2","FAKE ADDRESS","1583777624955",null);
INSERT INTO orders VALUES ("order3","12345","ebay_us","user3","FAKE ADDRESS","1583777632960",null);
