import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UpdateUser.css';

const UpdateUser = ({ isOpen, onClose, korisnik, updateUser }) => {
  const [imeKorisnik, setImeKorisnik] = useState(korisnik.ime);
  const [prezimeKorisnik, setPrezimeKorisnik] = useState(korisnik.prezime);
  const [emailKorisnik, setEmailKorisnik] = useState(korisnik.email);
  const [ulogaKorisnik, setUlogaKorisnik] = useState(korisnik.naziv_uloge);
  const [uloge, setUloge] = useState([]);
  const [ulica, setUlica] = useState(korisnik.adresa?.ulica || '');
  const [broj, setBroj] = useState(korisnik.adresa?.broj || '');
  const [grad, setGrad] = useState(korisnik.adresa?.grad || '');
  const [drzava, setDrzava] = useState(korisnik.adresa?.drzava || '');
  const [postanskiBroj, setPostanskiBroj] = useState(korisnik.adresa?.postanski_broj || '');
  const [pravaPristupa, setPravaPristupa] = useState(korisnik.prava_pristupa || []);
  const [azuriraniKorisnik, setAzuriraniKorisnik] = useState({});


  useEffect(() => {
    if (korisnik) {
      setImeKorisnik(korisnik.ime);
      setPrezimeKorisnik(korisnik.prezime);
      setEmailKorisnik(korisnik.email);
      setUlogaKorisnik(korisnik.naziv_uloge);
      setUlica(korisnik.adresa?.ulica || '');
      setBroj(korisnik.adresa?.broj || '');
      setGrad(korisnik.adresa?.grad || '');
      setDrzava(korisnik.adresa?.drzava || '');
      setPostanskiBroj(korisnik.adresa?.postanski_broj || '');
      setPravaPristupa(korisnik.prava_pristupa || []);
    }
    dohvatiUloge();
  }, [korisnik]);

  const dohvatiUloge = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/uloge');
      setUloge(response.data.uloge);
    } catch (error) {
      console.error('Greška prilikom dohvata uloga', error);
    }
  };

  useEffect(() => {
    dohvatiPrava();
  }, []);
  
  const dohvatiPrava = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/prava');
      const pravaNazivi = response.data.pravaPristupa.map(pravo => pravo.naziv_prava);
      setPravaPristupa(pravaNazivi);
    } catch (error) {
      console.error('Greška prilikom dohvata prava', error);
    }
};

const handleSubmit = (e) => {
  e.preventDefault();
  const odabranaUlogaId = uloge.find(uloga => uloga.naziv_uloge === ulogaKorisnik)?.id;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const odabranaUlogaId = uloge.find((uloga) => uloga.naziv_uloge === ulogaKorisnik)?.id;
    const noviAzuriraniKorisnik = {
      ime: imeKorisnik,
      prezime: prezimeKorisnik,
      email: emailKorisnik,
      uloga_id: odabranaUlogaId,
      adresa: {
        ulica,
        broj,
        grad,
        drzava,
        postanskiBroj,
      },
      prava_pristupa: pravaPristupa.map((pravo) => {
        return pravo; 
      }),
    };
  
    // Pretvorite adresa objekt u string prije slanja
    noviAzuriraniKorisnik.adresa = JSON.stringify(noviAzuriraniKorisnik.adresa);
  
    setAzuriraniKorisnik(noviAzuriraniKorisnik);
    updateUser(korisnik.id, noviAzuriraniKorisnik);
    onClose();
  }
};



  if (!isOpen) return null;


  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <form onSubmit={handleSubmit}>
          <label>Ime:</label>
          <input type="text" value={imeKorisnik} onChange={(e) => setImeKorisnik(e.target.value)} />

          <label>Prezime:</label>
          <input type="text" value={prezimeKorisnik} onChange={(e) => setPrezimeKorisnik(e.target.value)} />

          <label>Email:</label>
          <input type="email" value={emailKorisnik} onChange={(e) => setEmailKorisnik(e.target.value)} />

          <label>Uloga:</label>
          <select value={ulogaKorisnik} onChange={(e) => setUlogaKorisnik(e.target.value)}>
            {uloge.map((uloga) => (
              <option key={uloga.id} value={uloga.naziv_uloge}>{uloga.naziv_uloge}</option>
            ))}
          </select>

          <label>Ulica:</label>
          <input type="text" value={ulica} onChange={(e) => setUlica(e.target.value)} />

          <label>Broj:</label>
          <input type="text" value={broj} onChange={(e) => setBroj(e.target.value)} />

          <label>Grad:</label>
          <input type="text" value={grad} onChange={(e) => setGrad(e.target.value)} />

          <label>Država:</label>
          <input type="text" value={drzava} onChange={(e) => setDrzava(e.target.value)} />

          <label>Poštanski broj:</label>
          <input type="text" value={postanskiBroj} onChange={(e) => setPostanskiBroj(e.target.value)} />

          <label>Pravo pristupa:</label>
            <select
            value={pravaPristupa}
            onChange={(e) => setPravaPristupa(Array.isArray(e.target.value) ? e.target.value : [e.target.value])}
            multiple
            >
            <option key="" disabled>Odaberi pravo pristupa</option>
              {pravaPristupa.map((pravo, index) => (
                <option key={index} value={pravo}>{pravo}</option>
              ))}
            </select>

          <button type="submit">Ažuriraj korisnika</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;
