CREATE DATABASE adoptails;

USE adoptails;

CREATE TABLE animal (
  id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  nome     VARCHAR(100) NOT NULL,
  especie  VARCHAR(50)  NOT NULL,
  idade    VARCHAR(50),
  foto     LONGTEXT,
  adotado  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE adocao (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  animal_id        BIGINT NOT NULL,
  nome_interessado VARCHAR(150) NOT NULL,
  email            VARCHAR(150) NOT NULL,
  FOREIGN KEY (animal_id) REFERENCES animal(id)
);

INSERT INTO animal (nome, especie, idade, foto, adotado) VALUES
  ('Larry',           'Gato',     '3 anos',     'img/gato larry.jpg', FALSE),
  ('Rafael',          'Guaxinim', '1 ano',      'img/guaxi.jpg',      FALSE),
  ('Mestre Splinter', 'Coelho',   '5 decadas',  'img/ms.jpg',         FALSE),
  ('Pirito',          'Rato',     '8 meses',    'img/pirito.jpg',     FALSE);