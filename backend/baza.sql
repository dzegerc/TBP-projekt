CREATE TABLE uloge (
    id SERIAL PRIMARY KEY,
    naziv_uloge VARCHAR(255) NOT NULL
);

CREATE TABLE prava_pristupa (
    id SERIAL PRIMARY KEY,
    naziv_prava VARCHAR(255) NOT NULL,
    opis_prava TEXT
);

CREATE TYPE tip_adrese AS (
    ulica VARCHAR(255),
    broj VARCHAR(255),
    grad VARCHAR(255),
    drzava VARCHAR(255),
    postanski_broj VARCHAR(255)
);

CREATE TABLE osobe (
    id SERIAL PRIMARY KEY,
    ime VARCHAR(255) NOT NULL,
    prezime VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    lozinka VARCHAR(255) NOT NULL,
    adresa tip_adrese
);

CREATE TABLE korisnici_uloge (
    korisnik_id INT REFERENCES osobe(id),
    uloga_id INT REFERENCES uloge(id),
    PRIMARY KEY (korisnik_id, uloga_id)
);

CREATE TABLE korisnici_prava (
    korisnik_id INT REFERENCES osobe(id),
    pravo_id INT REFERENCES prava_pristupa(id),
    PRIMARY KEY (korisnik_id, pravo_id)
);

CREATE TYPE vrijeme_taska AS (
    datum_pocetka DATE,
    datum_zavrsetka DATE
);

CREATE TABLE taskovi (
    id SERIAL PRIMARY KEY,
    naziv_taska VARCHAR(255) NOT NULL,
    opis_taska TEXT,
    vremenski_okvir vrijeme_taska,
    dodijeljeni_korisnik_id INT REFERENCES osobe(id),
    dodijeljeni_moderator_id INT REFERENCES osobe(id)
);


INSERT INTO uloge (naziv_uloge) VALUES
    ('Administrator'),
    ('Moderator'),
    ('Običan korisnik');

INSERT INTO prava_pristupa (naziv_prava, opis_prava) VALUES
    ('Čitanje', 'Pravo čitanja sadržaja'),
    ('Čitanje i uređivanje taskova', 'Pravo čitanja i uređivanja taskova'),
    ('Potpuni pristup', 'Potpuni pristup sustavu');

-- Korisnici
INSERT INTO osobe (ime, prezime, email, lozinka, adresa) VALUES
    ('Admin', 'Admin', 'admin@gmail.com', 'admin', ROW('Ždralovska', '105', 'Bjelovar', 'Hrvatska', '43000')),
    ('Moderator', 'Moderator', 'moderator@gmail.com', 'mod', ROW('Ul. J. Strossmayera', '2', 'Bjelovar', 'Hrvatska', '43000')),
    ('Filip', 'Marić', 'fmaric@gmail.com', '123', ROW('Ul. Braće Radić', '15', 'Varaždin', 'Hrvatska', '42000')),
    ('Ana', 'Rajić', 'arajic@gmail.com', '111',  ROW('Ul. J. Strossmayera', '2', 'Varaždin', 'Hrvatska', '42000')),
    ('Vanesa', 'Tot', 'vanesa.tot@gmail.com', '121',  ROW('Masarykova ulica', '6', 'Varaždin', 'Hrvatska', '42000')),
    ('Mijo', 'Šimić', 'mijo.simic@gmail.com', '212',  ROW('Pavlinska 13', '2', 'Varaždin', 'Hrvatska', '42000')),
    ('Petra', 'Tomić', 'petra.tomic@gmail.com', '222',  ROW('Ul. J. Strossmayera', '2', 'Bjelovar', 'Hrvatska', '43000')),
    ('Marija', 'Hohot', 'marija.hohot@gmail.com', 'b23',  ROW('Ul. J. Strossmayera', '2', 'Bjelovar', 'Hrvatska', '43000')),
    ('Nikolina', 'Valjević', 'nikolina.valjevic@gmail.com', 'acz',  ROW('Ul. J. Strossmayera', '2', 'Bjelovar', 'Hrvatska', '43000')),
    ('Marko', 'Tuđan', 'marko.tudan@gmail.com', '271',  ROW('Ul. J. Strossmayera', '2', 'Bjelovar', 'Hrvatska', '43000')),
    ('Ante', 'Radić', 'ante.radic@gmail.com', 'h82',  ROW('Ul. J. Strossmayera', '2', 'Bjelovar', 'Hrvatska', '43000')),
    ('David', 'Darić', 'david.daric@gmail.com', '964',  ROW('Ul. J. Strossmayera', '2', 'Bjelovar', 'Hrvatska', '43000')),
    ('Patricija', 'Hrastić', 'patricija.hrastic@gmail.com', 'l5r',  ROW('Ul. J. Strossmayera', '2', 'Bjelovar', 'Hrvatska', '43000')),
    ('Luka', 'Fisko', 'luka.fisko@gmail.com', 'fsh52',  ROW('Ul. J. Strossmayera', '2', 'Bjelovar', 'Hrvatska', '43000')),
    ('Tihomir', 'Somber', 'tihomir.somber@gmail.com', 'hdhd8',  ROW('Trg Bana Jelačića', '22', 'Zagreb', 'Hrvatska', '10000')),
    ('Mirna', 'Pavlović', 'mirna.pavlovic@gmail.com', 'zxw632',  ROW('Haulikova', '74', 'Zagreb', 'Hrvatska', '10000')),
    ('Ema', 'Zorić', 'ema.zoric@gmail.com', 'w55',  ROW('Ilica', '98', 'Zagreb', 'Hrvatska', '10000')),
    ('Ivana', 'Bašić', 'ivana.basic@gmail.com', 'hdj',  ROW('Ul. Velog Jože', '61', 'Zagreb', 'Hrvatska', '10000')),
    ('Mihael', 'Koprek', 'mkoprek@gmail.com', 'vv3',  ROW('Šenoina', '2', 'Zagreb', 'Hrvatska', '10000')),
    ('Dino', 'Hajtić', 'dhajtic@gmail.com', 'pr0',  ROW('Ul. Zlatarova zlata', '33', 'Zagreb', 'Hrvatska', '10000')),
    ('Helena', 'Hohnjek', 'hhohnjek@gmail.com', 'pro',  ROW('Ivana Gundulića', '12', 'Bjelovar', 'Hrvatska', '43000'));


-- Povezivanje korisnika s ulogama
INSERT INTO korisnici_uloge (korisnik_id, uloga_id) VALUES
    (1, 1), 
    (2, 2), 
    (3, 3), 
    (4, 3),
    (5, 3),
    (6, 3),
    (7, 3),
    (8, 3),
    (9, 3),
    (10, 3),
    (11, 3),
    (12, 3),
    (13, 3),
    (14, 3),
    (15, 3),
    (16, 3),
    (17, 3),
    (18, 3),
    (19, 3),
    (20, 3),
    (21, 3);

-- Povezivanje korisnika s pravima pristupa
INSERT INTO korisnici_prava (korisnik_id, pravo_id) VALUES
    (1, 3), -- Administrator ima Potpuni pristup
    (2, 2), -- Moderator ima Čitanje i uređivanje taskova
    (3, 1), -- Običan korisnik ima Čitanje
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
    (20, 1),
    (21, 1);


INSERT INTO taskovi (naziv_taska, opis_taska, vremenski_okvir, dodijeljeni_korisnik_id, dodijeljeni_moderator_id) VALUES
    ('Implementacija korisničkog sučelja za prijavu', 'dizajnirati formu za prijavu korisnika, forma moza sadržavati polja za unos korisničkog imena i lozinke', ROW('2024-01-20', '2024-01-25'), 3, 1),
    ('Dizajniranje  navigacije', 'Stvoriti navigacijski sustav koji omogućuje korisnicima prelazak između različitih dijelova aplikacije', ROW('2024-02-01', '2024-02-10'), 4, 1),
    ('Integracija autentikacije putem društvenih mreža', 'Dodati mogućnost prijave putem računa na društvenim mrežama kao što su Google ili Facebook', ROW('2024-02-15', '2024-02-20'), 5, 1),
    ('Responzivnost komponenata', 'Osigurati da sve ključne komponente na stranici ispravno reagiraju na različite veličine zaslona', ROW('2024-03-01', '2024-03-10'), 6, 1),
    ('Pisanje unit testova za ključne komponente', 'Izraditi testove za ključne dijelove korisničkog sučelja kako biste osigurali njihovu funkcionalnost', ROW('2024-03-12', '2024-03-23'), 7, 1),
    ('Testiranje korisničkog sučelja', 'Provoditi testiranje korisničkog sučelja kako biste otkrili i ispravili eventualne probleme s korisničkim iskustvom', ROW('2024-03-17', '2024-03-29'), 8, 2),
    ('Implementacija komponente za prikaz popisa objekata', 'Stvoriti komponentu koja prikazuje listu objekata iz baze podataka', ROW('2024-03-29', '2024-04-04'), 9, 2),
    ('Dodavanje mogućnosti filtriranja i sortiranja popisa', 'Omogućiti korisnicima filtriranje i sortiranje popisa objekata prema različitim kriterijima', ROW('2024-04-01', '2024-04-10'), 10, 2),
    ('Implementacija sustava komentara', 'Stvoriti sustav komentara koji omogućava korisnicima komentiranje objekata', ROW('2024-04-11', '2024-04-18'), 11, 2),
    ('Razvoj modala za potvrdu radnji', 'Stvoriti modalni prozor koji se prikazuje prije nego se izvrši neka kritična radnja kako bi korisnici potvrdili svoju namjeru', ROW('2024-04-12', '2024-04-20'), 12, 2),
    ('Implementacija sustava pretrage', 'Dodati funkcionalnost pretrage koja omogućava korisnicima brzo pronalaženje objekata', ROW('2024-04-20', '2024-04-25'), 13,2),
    ('Pisanje API endpointa za komunikaciju s bazom podataka', 'Razviti API endpointe koji omogućavaju frontend dijelu pristup, spremanje i ažuriranje podataka u bazi', ROW('2024-04-25', '2024-04-30'), 14, 2),
    ('Implementacija sustava praćenja grešaka (Error tracking)', 'Postaviti sustav praćenja grešaka kako zbog bržeg identificiranja i rješavanja problema u produkciji', ROW('2024-05-01', '2024-05-06'), 15, 1),
    ('Implementacija tema', 'Dodati podršku za različite teme ili stilove kako bi korisnici mogli prilagoditi izgled aplikacije prema vlastitim preferencijama', ROW('2024-05-05', '2024-05-10'), 16, 1),
    ('Implementacija sustava praćenja korisničke aktivnosti', 'Razviti sustav koji bilježi korisničke aktivnosti unutar aplikacije, kako bi se omogućilo praćenje i analiza korisničkih radnji', ROW('2024-05-10', '2024-05-24'), 17, 1),
    ('Integracija sustava za slanje e-mail obavijesti', 'Dodati mogućnost slanja e-mail obavijesti korisnicima', ROW('2024-05-25', '2024-06-02'), 18,1),
    ('Implementacija funkcionalnosti "Zaboravljena lozinka" s e-mail obavijesti', 'Stvoriti funkciju za obnovu zaboravljene lozinke putem e-mail obavijesti i provesti integraciju s e-mail uslugom', ROW('2024-06-03', '2024-06-13'), 19, 1),
    ('Dodavanje podrške za više jezika', 'Implementirati sustav za prijevod sučelja na različite jezike i omogućiti korisnicima odabir željenog jezika', ROW('2024-06-15', '2024-06-25'), 20, 1);


