CREATE DATABASE IF NOT EXISTS Prototyper
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE Users (
  user_id    INT NOT NULL AUTO_INCREMENT,
  username   VARCHAR(256) NOT NULL,
  email      VARCHAR(256) NOT NULL,
  password   VARCHAR(256) NOT NULL,
  PRIMARY KEY(user_id)
);

INSERT INTO Users (`uname`, `email`, `passw`) VALUES ('anttij', 'antti@prototyper.tech', 'antti123');
INSERT INTO Users (`uname`, `email`, `passw`) VALUES ('john', 'johndoe@gmail', 'passpass');

CREATE TABLE Projects (
  project_id   INT NOT NULL AUTO_INCREMENT,
  name         VARCHAR(256) NOT NULL,
  created      DATETIME,
  modified     DATETIME,
  author_id    INT NOT NULL,
  PRIMARY KEY(project_id),
  FOREIGN KEY(author_id) REFERENCES Users(user_id)
);

INSERT INTO Projects (`name`, `created`, `modified`, `author_id`) VALUES ('prototyper', NOW(), NOW(), 1);


SELECT Projects.name, Users.uname FROM Projects INNER JOIN Users ON Projects.user_id=Users.user_id; 

CREATE TABLE Dirs (
  dir_id       INT NOT NULL AUTO_INCREMENT,
  name         VARCHAR(256) NOT NULL,
  parent       INT REFERENCES Dirs(dir_id),
  project_id   INT NOT NULL,
  PRIMARY KEY(dir_id),
  FOREIGN KEY(project_id) REFERENCES Projects(project_id) 
  ON UPDATE CASCADE
  ON DELETE CASCADE 
);

INSERT INTO Dirs (`name`, `parent`, `project_id`) VALUES ('root', NULL, 2);


--file_id INT NOT NULL AUTO_INCREMENT,
CREATE TABLE Files (
  file_id   INT NOT NULL AUTO_INCREMENT,
  name      VARCHAR(512) NOT NULL,
  created   DATETIME,
  modified  DATETIME,
  dir_id    INT NOT NULL,
  content   MEDIUMTEXT,
  PRIMARY KEY(file_id),
  FOREIGN KEY(dir_id) REFERENCES Dirs(dir_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE 
);

INSERT INTO Files (`name`, `pr_id`, `dir_id`, `content`) VALUES ('index.php', 2, 1, '<?php ?>');

INSERT INTO Files (`name`, `pr_id`, `dir_id`, `content`) VALUES ('Dispatcher.php', 2, 1, NULL);
INSERT INTO Files (`name`, `pr_id`, `dir_id`, `content`) VALUES ('Logger.php', 2, 1, NULL);
INSERT INTO Files (`name`, `pr_id`, `dir_id`, `content`) VALUES ('Controller.php', 2, 2, NULL);