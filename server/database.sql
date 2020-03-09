DROP DATABASE IF EXISTS groupbuy;
CREATE DATABASE groupbuy;
USE groupbuy;

CREATE TABLE products(
	productID VARCHAR(35) PRIMARY KEY,
	requiredGroup INT
);

CREATE TABLE orders(
	orderID VARCHAR(35) NOT NULL PRIMARY KEY,
	productID VARCHAR(35) NOT NULL,
  userID VARCHAR(35) NOT NULL,
	orderTime BIGINT NOT NULL,
  groupID VARCHAR(35),
	FOREIGN KEY (productID) REFERENCES products(productID),
  FOREIGN KEY (groupID) REFERENCES groups(groupID)
);

CREATE TABLE groups(
  groupID VARCHAR(35) NOT NULL PRIMARY KEY,
  productID VARCHAR(35),
  FOREIGN KEY (productID) REFERENCES products(productID)
);

INSERT INTO products VALUES ("12345",5);
INSERT INTO products VALUES ("67890",5);
INSERT INTO products VALUES ("54321",5);

INSERT INTO orders values ("order1","12345","user1","1583777588491",null);
INSERT INTO orders values ("order2","12345","user2","1583777624955",null);
INSERT INTO orders values ("order3","12345","user3","1583777632960",null);
