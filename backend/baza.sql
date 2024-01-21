CREATE TABLE uloge (
    id SERIAL PRIMARY KEY,
    naziv_uloge VARCHAR(255) NOT NULL
);


CREATE TABLE korisnici (
    id SERIAL PRIMARY KEY,
    ime VARCHAR(255) NOT NULL,
    prezime VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    lozinka VARCHAR(255) NOT NULL,
    uloga_id INT REFERENCES uloge(id) NOT NULL
);


CREATE TABLE prava_pristupa (
    id SERIAL PRIMARY KEY,
    naziv_prava VARCHAR(255) NOT NULL,
    opis_prava TEXT
);


CREATE TABLE korisnici_prava (
    id SERIAL PRIMARY KEY,
    korisnik_id INT REFERENCES korisnici(id) NOT NULL,
    pravo_id INT REFERENCES prava_pristupa(id) NOT NULL
);


CREATE TABLE taskovi (
    id SERIAL PRIMARY KEY,
    naziv_taska VARCHAR(255) NOT NULL,
    opis_taska TEXT,
    datum_pocetka DATE,
    datum_zavrsetka DATE,
    dodijeljeni_korisnik_id INT REFERENCES korisnici(id),
    dodijeljeni_moderator_id INT REFERENCES korisnici(id)
);


INSERT INTO uloge (naziv_uloge) VALUES 
  ('Administrator'),
  ('Moderator'),
  ('Običan korisnik');

INSERT INTO korisnici (ime, prezime, email, lozinka, uloga_id) VALUES 
  ('Admin', 'Admin', 'admin@gmail.com', 'admin', 1),
  ('Moderator', 'Moderator', 'moderator@gmail.com', 'mod', 2),
  ('Filip', 'Marić', 'fmaric@gmail.com', '123', 3),
  ('Ana', 'Rajić', 'arajic@gmail.com', '111', 3),
  ('Vanesa', 'Tot', 'vanesa.tot@gmail.com', '121', 3),
  ('Mijo', 'Šimić', 'mijo.simic@gmail.com', '212', 3),
  ('Petra', 'Tomić', 'petra.tomic@gmail.com', '222', 3),
  ('Marija', 'Hohot', 'marija.hohot@gmail.com', 'b23', 3),
  ('Nikolina', 'Valjević', 'nikolina.valjevic@gmail.com', 'acz', 3),
  ('Marko', 'Tuđan', 'marko.tudan@gmail.com', '271', 3),
  ('Ante', 'Radić', 'ante.radic@gmail.com', 'h82', 3),
  ('David', 'Darić', 'david.daric@gmail.com', '964', 3),
  ('Patricija', 'Hrastić', 'patricija.hrastic@gmail.com', 'l5r', 3),
  ('Luka', 'Fisko', 'luka.fisko@gmail.com', 'fsh52', 3),
  ('Tihomir', 'Somber', 'tihomir.somber@gmail.com', 'hdhd8', 3),
  ('Mirna', 'Pavlović', 'mirna.pavlovic@gmail.com', 'zxw632', 3),
  ('Ema', 'Zorić', 'ema.zoric@gmail.com', 'w55', 3),
  ('Ivana', 'Bašić', 'ivana.basic@gmail.com', 'hdj', 3),
  ('Mihael', 'Koprek', 'mkoprek@gmail.com', 'vv3', 3),
  ('Dino', 'Hajtić', 'dhajtic@gmail.com', 'pr0', 3),
  ('Helena', 'Hohnjek', 'hhohnjek@gmail.com', 'pro', 3);
       

INSERT INTO prava_pristupa (naziv_prava, opis_prava) VALUES 
  ('Čitanje', 'Pregled zadanih taskova'),
  ('Pisanje', 'Pravo dodavanja i uređivanja taskova'),
  ('Dodjela uloga', 'Pravo dodjele uloga drugim korisnicima');


INSERT INTO korisnici_prava (korisnik_id, pravo_id) VALUES 
  (1, 3),
  (1, 2),
  (2, 2),
  (3, 1),
  (4, 1),
  (5, 1),
  (6, 1),
  (7, 1),
  (8, 1),
  (9, 1),    
  (10, 1),
  (11, 1),
  (12, 1),
  (13, 1),
  (14, 1),
  (15, 1),
  (16, 1),
  (17, 1),
  (18, 1),
  (19, 1),
  (20, 1);          


INSERT INTO taskovi (naziv_taska, opis_taska, datum_pocetka, datum_zavrsetka, dodijeljeni_korisnik_id, dodijeljeni_moderator_id) VALUES 
  ('Implementacija korisničkog sučelja za prijavu', 'dizajnirati formu za prijavu korisnika, forma moza sadržavati polja za unos korisničkog imena i lozinke', '2024-01-20', '2024-01-25', 3, 1),
  ('Dizajniranje  navigacije', 'Stvoriti navigacijski sustav koji omogućuje korisnicima prelazak između različitih dijelova aplikacije', '2024-02-01', '2024-02-10', 4, 1),
  ('Integracija autentikacije putem društvenih mreža', 'Dodati mogućnost prijave putem računa na društvenim mrežama kao što su Google ili Facebook', '2024-02-15', '2024-02-20', 5, 1),
  ('Responzivnost komponenata', 'Osigurati da sve ključne komponente na stranici ispravno reagiraju na različite veličine zaslona', '2024-03-01', '2024-03-10', 6, 1),
  ('Pisanje unit testova za ključne komponente', 'Izraditi testove za ključne dijelove korisničkog sučelja kako biste osigurali njihovu funkcionalnost', '2024-03-12', '2024-03-23', 7, 1),
  ('Testiranje korisničkog sučelja', 'Provoditi testiranje korisničkog sučelja kako biste otkrili i ispravili eventualne probleme s korisničkim iskustvom', '2024-03-17', '2024-03-29', 8, 2),
  ('Implementacija komponente za prikaz popisa objekata', 'Stvoriti komponentu koja prikazuje listu objekata iz baze podataka', '2024-03-29', '2024-04-04', 9, 2),
  ('Dodavanje mogućnosti filtriranja i sortiranja popisa', 'Omogućiti korisnicima filtriranje i sortiranje popisa objekata prema različitim kriterijima', '2024-04-01', '2024-04-10', 10, 2),
  ('Implementacija sustava komentara', 'Stvoriti sustav komentara koji omogućava korisnicima komentiranje objekata', '2024-04-11', '2024-04-18', 11, 2),
  ('Razvoj modala za potvrdu radnji', 'Stvoriti modalni prozor koji se prikazuje prije nego se izvrši neka kritična radnja kako bi korisnici potvrdili svoju namjeru', '2024-04-12', '2024-04-20', 12, 2),
  ('Implementacija sustava pretrage', 'Dodati funkcionalnost pretrage koja omogućava korisnicima brzo pronalaženje objekata', '2024-04-20', '2024-04-25', 13,2),
  ('Pisanje API endpointa za komunikaciju s bazom podataka', 'Razviti API endpointe koji omogućavaju frontend dijelu pristup, spremanje i ažuriranje podataka u bazi', '2024-04-25', '2024-04-30', 14, 2),
  ('Implementacija sustava praćenja grešaka (Error tracking)', 'Postaviti sustav praćenja grešaka kako zbog bržeg identificiranja i rješavanja problema u produkciji', '2024-05-01', '2024-05-06', 15, 1),
  ('Implementacija tema', 'Dodati podršku za različite teme ili stilove kako bi korisnici mogli prilagoditi izgled aplikacije prema vlastitim preferencijama', '2024-05-05', '2024-05-10', 16, 1),
  ('Implementacija sustava praćenja korisničke aktivnosti', 'Razviti sustav koji bilježi korisničke aktivnosti unutar aplikacije, kako bi se omogućilo praćenje i analiza korisničkih radnji', '2024-05-10', '2024-05-24', 17, 1),
  ('Integracija sustava za slanje e-mail obavijesti', 'Dodati mogućnost slanja e-mail obavijesti korisnicima', '2024-05-25', '2024-06-02', 18,1),
  ('Implementacija funkcionalnosti "Zaboravljena lozinka" s e-mail obavijesti', 'Stvoriti funkciju za obnovu zaboravljene lozinke putem e-mail obavijesti i provesti integraciju s e-mail uslugom', '2024-06-03', '2024-06-13', 19, 1),
  ('Dodavanje podrške za više jezika', 'Implementirati sustav za prijevod sučelja na različite jezike i omogućiti korisnicima odabir željenog jezika', '2024-06-15', '2024-06-25', 20, 1);




