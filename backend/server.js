const express = require('express');
const bodyParser = require('body-parser');
const { Client  } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

const postgresConfig = {
  user: 'vjezbe',
  host: 'localhost',
  database: 'usersdb',
  password: 'vjezbe',
  port: 5432,
};

const client = new Client(postgresConfig);
client.connect();

// Ruta za prijavu korisnika
app.post('/api/prijava', async (req, res) => {
  const { email, lozinka } = req.body;

  try {
    const query = 'SELECT korisnici.*, uloge.naziv_uloge FROM korisnici JOIN uloge ON korisnici.uloga_id = uloge.id WHERE email = $1';
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ uspjeh: false, poruka: 'Neuspješna prijava' });
    }

    const korisnik = result.rows[0];

    // Provjera lozinku 
    const ispravnaLozinka = lozinka === korisnik.lozinka;

    if (!ispravnaLozinka) {
      return res.status(401).json({ uspjeh: false, poruka: 'Neuspješna prijava' });
    }

    // Generiranje JWT token ako je prijava uspješna
    const token = jwt.sign({ korisnikId: korisnik.id, uloga: korisnik.naziv_uloge }, 'tajna_lozinka', { expiresIn: '7d' });

    res.json({ uspjeh: true, token, uloga: korisnik.naziv_uloge });
  } catch (error) {
    console.error('Greška prilikom prijave', error);
    res.status(500).json({ uspjeh: false, poruka: 'Greška prilikom prijave' });
  }
});

const authMiddleware = (req, res, next) => {
  try {
    console.log('Authorization Header:', req.headers.authorization); 

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ poruka: 'Niste prijavljeni ili vam je sesija istekla' });
    }
    
    const token = req.headers.authorization.split(' ')[1];
    console.log('Token:', token); 
    const decodedToken = jwt.verify(token, 'tajna_lozinka');
    console.log('Decoded Token:', decodedToken); 

    req.userId = decodedToken.korisnikId;
    next();
  } catch (error) {
    console.error('Greška u authMiddleware:', error); 
    res.status(401).json({ poruka: 'Niste prijavljeni ili vam je sesija istekla' });
  }
};



//ruta za dohvaćanje svih taskova
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    
    // Dohvaćanje uloge korisnika
    const userRoleQuery = 'SELECT uloge.naziv_uloge FROM korisnici JOIN uloge ON korisnici.uloga_id = uloge.id WHERE korisnici.id = $1';
    const roleResult = await client.query(userRoleQuery, [userId]);

    if (roleResult.rows.length === 0) {
      return res.status(404).send('Korisnik nije pronađen');
    }

    const userRole = roleResult.rows[0].naziv_uloge;

    if (userRole === 'Administrator') {
      // Korisnik je administrator, dohvaćanje svih taskova
      const tasksQuery = 'SELECT * FROM taskovi';
      const tasksResult = await client.query(tasksQuery);
      res.json(tasksResult.rows);
    } else if (userRole === 'Moderator') {
      // Korisnik je moderator, dohvaćanje taskova za koje je zadužen
      const tasksQuery = 'SELECT * FROM taskovi WHERE dodijeljeni_moderator_id = $1';
      const tasksResult = await client.query(tasksQuery, [userId]);
      res.json(tasksResult.rows);
    } else {
      // Korisnik je obični korisnik, dohvatite taskove koji su mu dodijeljeni
      const tasksQuery = 'SELECT * FROM taskovi WHERE dodijeljeni_korisnik_id = $1';
      const tasksResult = await client.query(tasksQuery, [userId]);
      res.json(tasksResult.rows);
    }
  } catch (error) {
    console.error('Error prilikom dohvaćanja taskova', error);
    res.status(500).send('Greška na serveru');
  }
});


// Ruta za dohvaćanje svih korisnika
app.get('/api/korisnici', authMiddleware, async (req, res) => {
  try {
    const ulogaQuery = 'SELECT naziv_uloge FROM uloge WHERE id = $1';
    const ulogaResult = await client.query(ulogaQuery, [req.userId]);

    if (ulogaResult.rows.length === 0 || ulogaResult.rows[0].naziv_uloge !== 'Administrator') {
      return res.status(403).json({ uspjeh: false, poruka: 'Pristup dozvoljen samo administratorima' });
    }

    const query = `
      SELECT korisnici.id, korisnici.ime, korisnici.prezime, korisnici.email, uloge.naziv_uloge 
      FROM korisnici 
      INNER JOIN uloge ON korisnici.uloga_id = uloge.id
    `;
    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Greška prilikom dohvata korisnika', error);
    res.status(500).send('Greška prilikom dohvata korisnika' );
  }
});


//Ruta za dohvaćanje detalja o pojedinom korisniku
app.get('/api/korisnici/:id', async (req, res) => {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ uspjeh: false, poruka: 'Nije priložen token.' });
  }

  const token = authHeader.split(' ')[1]; 
  if (!token) {
    return res.status(401).json({ uspjeh: false, poruka: 'Token nije pronađen.' });
  }

  try {
        const korisnikId = req.params.id;

        // Upit za dohvat korisnika, njegove uloge i prava pristupa
        const query = `
            SELECT k.id, k.ime, k.prezime, k.email, u.naziv_uloge, 
                   array_agg(pp.naziv_prava) as prava_pristupa
            FROM korisnici k
            INNER JOIN uloge u ON k.uloga_id = u.id
            LEFT JOIN korisnici_prava kp ON k.id = kp.korisnik_id
            LEFT JOIN prava_pristupa pp ON kp.pravo_id = pp.id
            WHERE k.id = $1
            GROUP BY k.id, u.naziv_uloge
        `;

        const result = await client.query(query, [korisnikId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ uspjeh: false, poruka: 'Korisnik nije pronađen.' });
        }

        res.json({ uspjeh: true, korisnik: result.rows[0] });
    } catch (error) {
        console.error('Greška prilikom dohvata detalja korisnika', error);
        res.status(500).json({ uspjeh: false, poruka: 'Greška prilikom dohvata detalja korisnika.' });
    }
});

// Ruta za dohvaćanje korisnika dodijeljenih određenom moderatoru
app.get('/api/moderator/korisnici', authMiddleware, async (req, res) => {
  try {
    const { userId } = req;  

    // Provjera da li je korisnik moderator
    const ulogaQuery = 'SELECT naziv_uloge FROM uloge WHERE id = $1';
    const ulogaResult = await client.query(ulogaQuery, [req.userId]);

    if (ulogaResult.rows.length === 0 || ulogaResult.rows[0].naziv_uloge !== 'Moderator') {
      return res.status(403).json({ uspjeh: false, poruka: 'Pristup dozvoljen samo moderatorima' });
    }

    // Upit za dohvat korisnika koji su dodijeljeni moderatoru
    const query = `
      SELECT DISTINCT k.id, k.ime, k.prezime, k.email 
      FROM korisnici k
      INNER JOIN taskovi t ON k.id = t.dodijeljeni_korisnik_id
      WHERE t.dodijeljeni_moderator_id = $1;
    `;

    const result = await client.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Greška prilikom dohvata korisnika', error);
    res.status(500).send('Greška prilikom dohvata korisnika' );
  }
});



// Ruta za dohvaćanje korisnika dodijeljenih administratoru
app.get('/api/administrator/korisnici', authMiddleware, async (req, res) => {
  try {
    const { userId } = req;  

    // Provjera da li je korisnik administrator
    const ulogaQuery = 'SELECT naziv_uloge FROM uloge WHERE id = $1';
    const ulogaResult = await client.query(ulogaQuery, [req.userId]);

    if (ulogaResult.rows.length === 0 || ulogaResult.rows[0].naziv_uloge !== 'Administrator') {
      return res.status(403).json({ uspjeh: false, poruka: 'Pristup dozvoljen samo administratorima' });
    }

    const query = `
      SELECT DISTINCT k.id, k.ime, k.prezime, k.email 
      FROM korisnici k
      INNER JOIN taskovi t ON k.id = t.dodijeljeni_korisnik_id
      WHERE t.dodijeljeni_moderator_id = $1;
    `;

    const result = await client.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Greška prilikom dohvata korisnika', error);
    res.status(500).send('Greška prilikom dohvata korisnika' );
  }
});



//Ruta zaažuriranje taskova od strane moderatora ili administratora
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { naziv_taska, opis_taska, datum_pocetka, datum_zavrsetka, dodijeljeni_korisnik_id, dodijeljeni_moderator_id } = req.body;

  if (!naziv_taska || !opis_taska || !datum_pocetka || !datum_zavrsetka) {
    return res.status(400).json({ error: 'Nedostaju potrebni podaci' });
  }

  const ulogaQuery = 'SELECT naziv_uloge FROM uloge WHERE id = $1';
  const ulogaResult = await client.query(ulogaQuery, [req.userId]);

  if (ulogaResult.rows.length === 0 || 
      (ulogaResult.rows[0].naziv_uloge !== 'Administrator' && 
      ulogaResult.rows[0].naziv_uloge !== 'Moderator')) {
    return res.status(403).json({ uspjeh: false, poruka: 'Pristup dozvoljen samo administratorima i moderatorima' });
  }

  const query = `
      UPDATE taskovi
      SET naziv_taska = $1, opis_taska = $2, datum_pocetka = $3, datum_zavrsetka = $4, dodijeljeni_korisnik_id = $5, dodijeljeni_moderator_id = $6
      WHERE id = $7
  `;

  try {
      await client.query(query, [naziv_taska, opis_taska, datum_pocetka, datum_zavrsetka, dodijeljeni_korisnik_id, dodijeljeni_moderator_id, id]);
      res.status(200).json({ message: 'Task successfully updated' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});



// Ruta za dohvaćanje uloga
app.get('/api/uloge', async (req, res) => {
  try {
      const rezultat = await client.query('SELECT * FROM uloge');
      res.json({ uloge: rezultat.rows });
  } catch (error) {
      console.error('Greška prilikom dohvaćanja uloga', error);
      res.status(500).send('Greška prilikom dohvaćanja uloga');
  }
});


//Ruta za ažuriranje informacija o korisnicima i promjenu uloge
app.put('/api/korisnici/:id/uloga', authMiddleware, async (req, res) => {
  const korisnikId = req.params.id;
  const { ime, prezime, email, uloga_id } = req.body;

  const ulogaQuery = 'SELECT naziv_uloge FROM uloge WHERE id = $1';
  const ulogaResult = await client.query(ulogaQuery, [req.userId]);

  if (ulogaResult.rows.length === 0 || 
      (ulogaResult.rows[0].naziv_uloge !== 'Administrator' && 
      ulogaResult.rows[0].naziv_uloge !== 'Moderator')) {
    return res.status(403).json({ uspjeh: false, poruka: 'Pristup dozvoljen samo administratorima i moderatorima' });
  }

  const updateQuery = 'UPDATE korisnici SET ime = $1, prezime = $2, email = $3, uloga_id = $4 WHERE id = $5';

  try {
    await client.query(updateQuery, [ime, prezime, email, uloga_id, korisnikId]);
    res.json({ uspjeh: true, poruka: 'Podaci korisnika ažurirani' });
  } catch (error) {
    console.error('Greška prilikom ažuriranja podataka korisnika', error);
    res.status(500).json({ uspjeh: false, poruka: 'Greška prilikom ažuriranja podataka korisnika' });
  }
});


app.listen(port, () => {
  console.log(`Server sluša na portu ${port}`);
});