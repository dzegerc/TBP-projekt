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
  database: 'taskdb',
  password: 'vjezbe',
  port: 5432,
};

const client = new Client(postgresConfig);

client.connect(err => {
  if (err) {
      console.error('Greška prilikom povezivanja s bazom:', err.stack);
  } else {
      console.log('Uspješno povezano s bazom podataka');
  }
});

app.post('/api/prijava', async (req, res) => {
  const { email, lozinka } = req.body;

  try {
    const query = `
      SELECT osobe.*, uloge.naziv_uloge
      FROM osobe
      JOIN korisnici_uloge ON osobe.id = korisnici_uloge.korisnik_id
      JOIN uloge ON korisnici_uloge.uloga_id = uloge.id
      WHERE osobe.email = $1
    `;
    
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ uspjeh: false, poruka: 'Neuspješna prijava' });
    }

    const korisnik = result.rows[0];

    // Provjera lozinke 
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
    jwt.verify(token, 'tajna_lozinka', (err, decodedToken) => {
      if (err) {
        console.error('Greška prilikom verifikacije tokena:', err);
        return res.status(401).json({ poruka: 'Niste prijavljeni ili vam je sesija istekla' });
      }
      console.log('Decoded Token:', decodedToken); 
      req.userId = decodedToken.korisnikId;
      next();
    });
  } catch (error) {
    console.error('Greška u authMiddleware:', error); 
    res.status(401).json({ poruka: 'Niste prijavljeni ili vam je sesija istekla' });
  }
};


app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    
    // Dohvaćanje uloge korisnika
    const userRoleQuery = 'SELECT uloge.naziv_uloge FROM korisnici_uloge JOIN uloge ON korisnici_uloge.uloga_id = uloge.id WHERE korisnici_uloge.korisnik_id = $1';
    const roleResult = await client.query(userRoleQuery, [userId]);

    if (roleResult.rows.length === 0) {
      return res.status(404).send('Korisnik nije pronađen');
    }

    const userRole = roleResult.rows[0].naziv_uloge;

    let tasksQuery;
    let tasksResult;

    if (userRole === 'Administrator') {
      // Korisnik je administrator, dohvaćanje svih taskova
      tasksQuery = 'SELECT * FROM taskovi';
      tasksResult = await client.query(tasksQuery);
    } else if (userRole === 'Moderator') {
      // Korisnik je moderator, dohvaćanje taskova za koje je zadužen
      tasksQuery = 'SELECT * FROM taskovi WHERE dodijeljeni_moderator_id = $1';
      tasksResult = await client.query(tasksQuery, [userId]);
    } else {
      // Korisnik je obični korisnik, dohvatite taskove koji su mu dodijeljeni
      tasksQuery = 'SELECT * FROM taskovi WHERE dodijeljeni_korisnik_id = $1';
      tasksResult = await client.query(tasksQuery, [userId]);
    }

    res.json(tasksResult.rows);
  } catch (error) {
    console.error('Greška prilikom dohvaćanja taskova', error);
    res.status(500).send('Greška na serveru');
  }
});



app.get('/api/korisnici', authMiddleware, async (req, res) => {
  try {
    const { userId } = req;

    // Dohvaćanje uloge korisnika
    const userRoleQuery = 'SELECT uloge.naziv_uloge FROM osobe JOIN korisnici_uloge ON osobe.id = korisnici_uloge.korisnik_id JOIN uloge ON korisnici_uloge.uloga_id = uloge.id WHERE osobe.id = $1';
    const roleResult = await client.query(userRoleQuery, [userId]);

    if (roleResult.rows.length === 0) {
      return res.status(404).send('Korisnik nije pronađen');
    }

    const userRole = roleResult.rows[0].naziv_uloge;

    if (userRole !== 'Administrator') {
      return res.status(403).json({ uspjeh: false, poruka: 'Pristup dozvoljen samo administratorima' });
    }

    const query = `
      SELECT osobe.id, osobe.ime, osobe.prezime, osobe.email, uloge.naziv_uloge 
      FROM osobe 
      JOIN korisnici_uloge ON osobe.id = korisnici_uloge.korisnik_id 
      JOIN uloge ON korisnici_uloge.uloga_id = uloge.id
    `;
    
    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Greška prilikom dohvata korisnika', error);
    res.status(500).send('Greška prilikom dohvata korisnika');
  }
});

app.get('/api/korisnici/:id', async (req, res) => {
  try {
    const korisnikId = req.params.id;

    // Dohvat podataka o korisniku, njegovoj ulozi, pravima pristupa i adresi
    const query = `
    SELECT 
          k.id, k.ime, k.prezime, k.email, 
          u.naziv_uloge, 
          array_agg(pp.naziv_prava) as prava_pristupa,
          k.adresa AS adresa
          FROM osobe k
          JOIN korisnici_uloge ku ON k.id = ku.korisnik_id
          JOIN uloge u ON ku.uloga_id = u.id
          LEFT JOIN korisnici_prava kp ON k.id = kp.korisnik_id
          LEFT JOIN prava_pristupa pp ON kp.pravo_id = pp.id
          WHERE k.id = $1
          GROUP BY k.id, u.naziv_uloge, k.adresa;

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



app.get('/api/moderator/korisnici', authMiddleware, async (req, res) => {
  try {
    const { userId } = req;

    // Provjera je li korisnik moderator
    const ulogaQuery = 'SELECT naziv_uloge FROM osobe JOIN korisnici_uloge ON osobe.id = korisnici_uloge.korisnik_id JOIN uloge ON korisnici_uloge.uloga_id = uloge.id WHERE osobe.id = $1';
    const ulogaResult = await client.query(ulogaQuery, [userId]);

    if (ulogaResult.rows.length === 0 || ulogaResult.rows[0].naziv_uloge !== 'Moderator') {
      return res.status(403).json({ uspjeh: false, poruka: 'Pristup dozvoljen samo moderatorima' });
    }

    // Upit za dohvaćanje korisnika koji su dodijeljeni moderatoru
    const query = `
      SELECT DISTINCT k.id, k.ime, k.prezime, k.email 
      FROM osobe k
      JOIN taskovi t ON k.id = t.dodijeljeni_korisnik_id
      WHERE t.dodijeljeni_moderator_id = $1
    `;

    const result = await client.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Greška prilikom dohvata korisnika', error);
    res.status(500).send('Greška prilikom dohvata korisnika');
  }
});

app.get('/api/administrator/korisnici', authMiddleware, async (req, res) => {
  try {
    const { userId } = req;

    // Provjera je li korisnik administrator
    const ulogaQuery = 'SELECT naziv_uloge FROM osobe JOIN korisnici_uloge ON osobe.id = korisnici_uloge.korisnik_id JOIN uloge ON korisnici_uloge.uloga_id = uloge.id WHERE osobe.id = $1';
    const ulogaResult = await client.query(ulogaQuery, [userId]);

    if (ulogaResult.rows.length === 0 || ulogaResult.rows[0].naziv_uloge !== 'Administrator') {
      return res.status(403).json({ uspjeh: false, poruka: 'Pristup dozvoljen samo administratorima' });
    }

    // Upit za dohvaćanje svih korisnika ili određene grupe koju administrator treba vidjeti
    const query = `
      SELECT DISTINCT k.id, k.ime, k.prezime, k.email 
      FROM osobe k
      INNER JOIN taskovi t ON k.id = t.dodijeljeni_korisnik_id
      WHERE t.dodijeljeni_moderator_id = $1;
    `;

    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Greška prilikom dohvata korisnika', error);
    res.status(500).send('Greška prilikom dohvata korisnika');
  }
});


app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { naziv_taska, opis_taska, vremenski_okvir, dodijeljeni_korisnik_id, dodijeljeni_moderator_id } = req.body;

  if (!naziv_taska || !opis_taska || !vremenski_okvir) {
    return res.status(400).json({ error: 'Nedostaju potrebni podaci' });
  }

  try {
    const { userId } = req;

    // Provjera je li korisnik administrator ili moderator
    const ulogaQuery = 'SELECT naziv_uloge FROM osobe JOIN korisnici_uloge ON osobe.id = korisnici_uloge.korisnik_id JOIN uloge ON korisnici_uloge.uloga_id = uloge.id WHERE osobe.id = $1';
    const ulogaResult = await client.query(ulogaQuery, [userId]);

    if (ulogaResult.rows.length === 0 || (ulogaResult.rows[0].naziv_uloge !== 'Administrator' && ulogaResult.rows[0].naziv_uloge !== 'Moderator')) {
      return res.status(403).json({ uspjeh: false, poruka: 'Pristup dozvoljen samo administratorima i moderatorima' });
    }

    // Ažuriranje taska
    const query = `
      UPDATE taskovi
      SET naziv_taska = $1, opis_taska = $2, vremenski_okvir = $3, dodijeljeni_korisnik_id = $4, dodijeljeni_moderator_id = $5
      WHERE id = $6
    `;

    await client.query(query, [naziv_taska, opis_taska, vremenski_okvir, dodijeljeni_korisnik_id, dodijeljeni_moderator_id, id]);
    res.status(200).json({ message: 'Task successfully updated' });
  } catch (error) {
    console.error('Greška prilikom ažuriranja taska', error);
    res.status(500).json({ message: 'Greška prilikom ažuriranja taska' });
  }
});


app.get('/api/uloge', async (req, res) => {
  try {
    // Upit za dohvaćanje svih uloga
    const query = 'SELECT * FROM uloge';
    const result = await client.query(query);
    res.json({ uloge: result.rows });
  } catch (error) {
    console.error('Greška prilikom dohvaćanja uloga', error);
    res.status(500).send('Greška prilikom dohvaćanja uloga');
  }
});

app.get('/api/prava', async (req, res) => {
  try {
    const query = 'SELECT * FROM prava_pristupa';
    const result = await client.query(query);
    res.json({ pravaPristupa: result.rows });
  } catch (error) {
    console.error('Greška prilikom dohvaćanja prava pristupa', error);
    res.status(500).send('Greška prilikom dohvaćanja prava pristupa');
  }
});

// Ruta za ažuriranje informacija o korisnicima i promjenu uloge
app.put('/api/korisnici/:id/uloga', authMiddleware, async (req, res) => {
  const korisnikId = req.params.id;
  const { ime, prezime, email, uloga_id, adresa } = req.body;

  const ulogaQuery = 'SELECT naziv_uloge FROM uloge WHERE id = $1';
  const ulogaResult = await client.query(ulogaQuery, [req.userId]);

  if (
    ulogaResult.rows.length === 0 ||
    (ulogaResult.rows[0].naziv_uloge !== 'Administrator' &&
      ulogaResult.rows[0].naziv_uloge !== 'Moderator')
  ) {
    return res.status(403).json({
      uspjeh: false,
      poruka: 'Pristup dozvoljen samo administratorima i moderatorima',
    });
  }

  const updateOsobeQuery =
  'UPDATE osobe SET ime = $1, prezime = $2, email = $3, adresa = $4 WHERE id = $5';


const updateKorisniciUlogeQuery =
  'UPDATE korisnici_uloge SET uloga_id = $1 WHERE korisnik_id = $2';

const updateAdresaQuery =
  'UPDATE osobe SET adresa = $1 WHERE id = $2';

  try {
    await client.query('BEGIN');
  
    // Ažuriranje informacija o korisniku
    await client.query(updateOsobeQuery, [ime, prezime, email, azuriraniKorisnik.adresa, korisnikId]);
  
    // Ažuriranje uloge korisnika
    await client.query(updateKorisniciUlogeQuery, [azuriraniKorisnik.uloga_id, korisnikId]);
  
    // Ažuriranje adrese korisnika
    await client.query(updateAdresaQuery, [azuriraniKorisnik.adresa, korisnikId]);
  

  await client.query('COMMIT');
  res.json({ uspjeh: true, poruka: 'Podaci korisnika ažurirani' });
} catch (error) {
  await client.query('ROLLBACK');
  console.error('Greška prilikom ažuriranja podataka korisnika', error);
  res.status(500).json({ uspjeh: false, poruka: 'Greška prilikom ažuriranja podataka korisnika' });
} finally {
}
});

app.listen(port, () => {
  console.log(`Server sluša na portu ${port}`);
});
