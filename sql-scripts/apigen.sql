CREATE DATABASE IF NOT EXISTS AGDB__*
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE USER '*'@'localhost' IDENTIFIED BY '$pass';
GRANT ALL ON AGDB__*.* TO '*'@'localhost';
FLUSH PRIVILEGES;

CREATE TABLE Users (
  user_id    INT NOT NULL AUTO_INCREMENT,
  username   VARCHAR(256) NOT NULL,
  email      VARCHAR(256) NOT NULL,
  password   VARCHAR(256) NOT NULL,
  PRIMARY KEY(user_id)
);

INSERT INTO Users (`uname`, `email`, `password`) VALUES ('anttij', 'antti@prototyper.tech', 'antti123');
INSERT INTO Users (`uname`, `email`, `password`) VALUES ('john', 'johndoe@gmail', 'passpass');

CREATE TABLE Apis (
  api_id  INT NOT NULL AUTO_INCREMENT,
  name    VARCHAR(128) NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY(api_id),
  FOREIGN KEY(user_id) REFERENCES Users(user_id)  
);

INSERT INTO Apis (`name`, `user_id`) VALUES ('blaze', 1);
INSERT INTO Apis (`name`, `user_id`) VALUES ('prototyper', 1);
INSERT INTO Apis (`name`, `user_id`) VALUES ('app', 2);
INSERT INTO Apis (`name`, `user_id`) VALUES ('devtools', 1);
INSERT INTO Apis (`name`, `user_id`) VALUES ('backend', 1);

CREATE TABLE Tables (
  table_id  INT NOT NULL AUTO_INCREMENT,
  name      VARCHAR(128) NOT NULL,
  api_id    INT NOT NULL,
  INDEX (name),
  PRIMARY   KEY(table_id),
  FOREIGN   KEY(api_id) REFERENCES Apis(api_id)  
  ON UPDATE CASCADE
  ON DELETE CASCADE   
);

INSERT INTO Tables (`name`, `api_id`) VALUES ('Users', 6);
INSERT INTO Tables (`name`, `api_id`) VALUES ('Projects', 6);
INSERT INTO Tables (`name`, `api_id`) VALUES ('Dirs', 6);
INSERT INTO Tables (`name`, `api_id`) VALUES ('Files', 6);


CREATE TABLE Fields (
  field_id    INT NOT NULL AUTO_INCREMENT,
  name        VARCHAR(128) NOT NULL,
  type        ENUM('BIT', 'BLOB', 'CLOB', 'CHAR', 'TEXT', 'FLOAT', 'BINARY', 'DECIMAL', 'DOUBLE', 'INTEGER', 'VARCHAR', 'BOOLEAN', 'LONGTEXT', 'DATETIME', 'TIMESTAMP', 'VARBINARY', 'MEDIUMTEXT'),
  size        INT,
  nullable    BIT,
  table_id    INT NOT NULL,
  INDEX (name),
  PRIMARY KEY(field_id),
  FOREIGN KEY(table_id) REFERENCES Tables(table_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE   
);

INSERT INTO Fields (`name`, `type`, `size`, `cn`, `table_id`, `nullable`, `defaultval`) VALUES ('id', 'INTEGER', NULL, 'AUTO INCREMENT', 4);
INSERT INTO Fields (`name`, `type`, `size`, `cn`, `table_id`) VALUES ('name', 'VARCHAR', 128, 'NOT NULL', 4);
INSERT INTO Fields (`name`, `type`, `size`, `cn`, `table_id`) VALUES ('email', 'VARCHAR', 256, 'NOT NULL', 4);
INSERT INTO Fields (`name`, `type`, `size`, `cn`, `table_id`) VALUES ('password', 'VARCHAR', 64, 'NOT NULL', 4);
INSERT INTO Fields (`name`, `type`, `size`, `cn`, `table_id`) VALUES ('id', 'INTEGER', NULL, 'AUTO INCREMENT', 5);
INSERT INTO Fields (`name`, `type`, `size`, `cn`, `table_id`) VALUES ('name', 'VARCHAR', 128, 'NOT NULL', 5);
INSERT INTO Fields (`name`, `type`, `size`, `cn`, `table_id`) VALUES ('author', 'INTEGER', NULL, 'NOT NULL', 5);

CREATE TABLE Constraints (
  api_id           INT NOT NULL,  
  type             ENUM('CHECK', 'INDEX', 'UNIQUE', 'DEFAULT', 'NOT NULL', 'PRIMARY KEY', 'FOREIGN KEY', 'AUTO_INCREMENT'),
  target_table     VARCHAR(256) NOT NULL,
  target_field     VARCHAR(256) NOT NULL,
  action           VARCHAR(512),
  PRIMARY KEY(api_id, type, target_table, target_field),
  FOREIGN KEY(api_id)       REFERENCES Apis(api_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,  
  FOREIGN KEY(target_table) REFERENCES Tables(name)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  FOREIGN KEY(target_field) REFERENCES Fields(name)
  ON UPDATE CASCADE
  ON DELETE CASCADE  
);

INSERT INTO Constraints (`api_id`, `type`, `target_table`, `target_field`) VALUES ('6', 'AUTO_INCREMENT', 'Users', 'id');
INSERT INTO Constraints (`api_id`, `type`, `target_table`, `target_field`) VALUES ('6', 'AUTO_INCREMENT', 'Projects', 'id');
INSERT INTO Constraints (`api_id`, `type`, `target_table`, `target_field`) VALUES ('6', 'NOT NULL', 'Users', 'id');

/********************************************************
 * New Indices, 
 * api_id changed to table_id
 * ---------
 * Only one foreign key, target_field referring to 'Fields'::name
 *
 */
CREATE TABLE Indices (

    table_id         INT NOT NULL,
    target_field     VARCHAR( 256 ) NOT NULL,
    name             VARCHAR( 256 ),
    PRIMARY KEY( table_id, target_field ),
    FOREIGN KEY( target_field ) REFERENCES Fields( name )
    ON UPDATE CASCADE
    ON DELETE CASCADE

);

/* table_id 32: Users, table_id 33: Projects, 34: Dirs, 35: Files */


INSERT INTO Indices ( `table_id`,  `target_field` ) VALUES ( '32', 'username' );
INSERT INTO Indices ( `table_id`,  `target_field` ) VALUES ( '32', 'email' );
INSERT INTO Indices ( `table_id`,  `target_field` ) VALUES ( '32', 'password' );

INSERT INTO Indices ( `table_id`,  `target_field` ) VALUES ( '33', 'name' );

INSERT INTO Indices ( `table_id`,  `target_field` ) VALUES ( '35', 'name' );
INSERT INTO Indices ( `table_id`,  `target_field` ) VALUES ( '35', 'content' );

/********************************************************
 * Old Indices
 */
CREATE TABLE Indices (
    api_id           INT NOT NULL,
    target_table     VARCHAR(256) NOT NULL,
    target_field     VARCHAR(256) NOT NULL,
    name             VARCHAR(256),
    PRIMARY KEY(api_id, target_table),
    FOREIGN KEY(api_id)       REFERENCES Apis(api_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    FOREIGN KEY(target_table) REFERENCES Tables(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    FOREIGN KEY(target_field) REFERENCES Fields(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

INSERT INTO Indices(`api_id`, `target_table`, `target_field`) VALUES ('6', 'Users', 'name');
INSERT INTO Indices(`api_id`, `target_table`, `target_field`) VALUES ('6', 'Projects', 'name');

/********************************************************
 * New PrimaryKeys, 
 * api_id changed to table_id
 * ---------
 * Only one foreign key, target_field referring to 'Fields'::name
 *
 */

CREATE TABLE PrimaryKeys (

    table_id            INT NOT NULL,
    target_field        VARCHAR( 256 ) NOT NULL,
    
    PRIMARY KEY ( table_id, target_field ),

    FOREIGN KEY ( target_field )    REFERENCES Fields( name )
                                    ON UPDATE CASCADE
                                    ON DELETE CASCADE

);

/* table_id 32: Users, table_id 33: Projects */


INSERT INTO PrimaryKeys ( `table_id`,  `target_field` ) VALUES ( '32', 'user_id' );
INSERT INTO PrimaryKeys ( `table_id`,  `target_field` ) VALUES ( '32', 'email' );
INSERT INTO PrimaryKeys ( `table_id`,  `target_field` ) VALUES ( '32', 'password' );

INSERT INTO PrimaryKeys ( `table_id`,  `target_field` ) VALUES ( '33', 'project_id' );
INSERT INTO PrimaryKeys ( `table_id`,  `target_field` ) VALUES ( '33', 'author_id' );
INSERT INTO PrimaryKeys ( `table_id`,  `target_field` ) VALUES ( '33', 'name' );

/********************************************************
 * New ForeignKeys, 
 * api_id changed to table_id
 * ---------
 * Only one foreign key, referring to reference table name
 *
 */

CREATE TABLE ForeignKeys (

    table_id            INT NOT NULL,
    target_field        VARCHAR(256) NOT NULL,
    reference_table     VARCHAR(256) NOT NULL,
    reference_field     VARCHAR(256) NOT NULL,
    on_delete           VARCHAR(256),
    on_update           VARCHAR(256),

    PRIMARY KEY ( table_id, target_field ),

    FOREIGN KEY ( target_field )    REFERENCES Fields( name )
                                    ON UPDATE CASCADE
                                    ON DELETE CASCADE    
);

INSERT INTO ForeignKeys( `table_id`, `target_field`, `reference_table`, `reference_field`, `on_delete`, `on_update` ) 
VALUES ( '33',  'author_id', 'Users', 'id', 'CASCADE', 'CASCADE' );
INSERT INTO ForeignKeys( `table_id`, `target_field`, `reference_table`, `reference_field`, `on_delete`, `on_update` ) 
VALUES ( '34',  'project_id', 'Projects', 'project_id', 'CASCADE', 'CASCADE' );
INSERT INTO ForeignKeys( `table_id`, `target_field`, `reference_table`, `reference_field`, `on_delete`, `on_update` ) 
VALUES ( '35',  'dir_id', 'Dirs', 'dir_id', 'CASCADE', 'CASCADE' );


CREATE TABLE AutoIncrements (
    target_table   VARCHAR(256) NOT NULL,
    target_field   VARCHAR(256) NOT NULL,
    step           INT NOT NULL DEFAULT 1,
    PRIMARY KEY(target_table, target_field),
    FOREIGN KEY(target_table) REFERENCES Tables(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    FOREIGN KEY(target_field) REFERENCES Fields(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

INSERT INTO AutoIncrements(`table_id`, `field_id`, `step`) VALUES (5, 6, 1);

CREATE TABLE Defaults (
    target_table     VARCHAR(256) NOT NULL,
    target_field     VARCHAR(256) NOT NULL,
    defaultval       VARCHAR(256) NOT NULL,
    PRIMARY KEY(target_table),
    FOREIGN KEY(target_table) REFERENCES Tables(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    FOREIGN KEY(target_field) REFERENCES Fields(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);


/********************************************************
 * New Checks 
 * api_id changed to table_id
 * target_table removed
 * ---------
 * Only one foreign key, target_field referring to Fields::name
 *
 */
CREATE TABLE Checks (

    table_id         INT NOT NULL,
    target_field     VARCHAR(256) NOT NULL,
    expression       VARCHAR(512) NOT NULL,
    name             VARCHAR(256),
    PRIMARY KEY( table_id, target_field ),
    FOREIGN KEY(target_field) REFERENCES Fields(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE
    
);

INSERT INTO Checks ( `table_id`, `target_field`, `expression`)
VALUES ( '32', 'username', 'length > 1');
INSERT INTO Checks ( `table_id`, `target_field`, `expression`)
VALUES ( '32', 'email', 'length >= 6');
INSERT INTO Checks ( `table_id`, `target_field`, `expression`)
VALUES ( '32', 'password', 'length > 1');

INSERT INTO Checks ( `table_id`, `target_field`, `expression`)
VALUES ( '33', 'name', 'length >= 3');

INSERT INTO Checks ( `table_id`, `target_field`, `expression`)
VALUES ( '35', 'name', 'length >= 3');
INSERT INTO Checks ( `table_id`, `target_field`, `expression`)
VALUES ( '35', 'dir_id', 'dir_id > 0');
/********************************************************
 * Old Checks
 */
CREATE TABLE Checks (

    api_id           INT NOT NULL,
    target_table     VARCHAR(256) NOT NULL,
    target_field     VARCHAR(256) NOT NULL,
    expression       VARCHAR(512) NOT NULL,
    name             VARCHAR(256),
    PRIMARY KEY(api_id, target_table),
    FOREIGN KEY(api_id)       REFERENCES Apis(api_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE, 
    FOREIGN KEY(target_table) REFERENCES Tables(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    FOREIGN KEY(target_field) REFERENCES Fields(name)
    ON UPDATE CASCADE
    ON DELETE CASCADE

);

INSERT INTO (`api_id`, `target_table`, `target_field`, `expression`)
VALUES ('6', 'Users', 'name', 'length > 1');

CREATE USER 'apigenuser'@'localhost' IDENTIFIED BY 'apipass';
CREATE USER 'apigenguest'@'localhost' IDENTIFIED BY 'apipass';

GRANT ALL 
ON Apigen.* 
TO 'apigenuser'@'localhost';

ALTER USER 'apigenuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'apipass';

CREATE TABLE Login (
  user_id    INT NOT NULL AUTO_INCREMENT,
  username   VARCHAR(128) NOT NULL,
  email      VARCHAR(256) NOT NULL,
  password   VARCHAR(256) NOT NULL,
  PRIMARY KEY(user_id)
);

INSERT INTO Users (`uname`, `email`, `password`) VALUES ('anttij', 'antti@prototyper.tech', 'antti123');
INSERT INTO Users (`uname`, `email`, `password`) VALUES ('john', 'johndoe@gmail', 'passpass');