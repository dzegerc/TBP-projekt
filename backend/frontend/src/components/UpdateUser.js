import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UpdateUser.css';

const UpdateUser = ({isOpen, onClose, korisnik, updateUser}) => {
    const [imeKorisnik, setImeKorisnik] = useState(korisnik.ime);
    const [prezimeKorisnik, setPrezimeKorisnik] = useState(korisnik.prezime);
    const [emailKorisnik, setEmailKorisnik] = useState(korisnik.email);
    const [ulogaKorisnik, setUlogaKorisnik] = useState(korisnik.uloga_id);
    const [uloge, setUloge] = useState([]);

    useEffect(() => {
        if(korisnik) {
            setImeKorisnik(korisnik.ime);
            setPrezimeKorisnik(korisnik.prezime);
            setEmailKorisnik(korisnik.email);
            setUlogaKorisnik(korisnik.uloga_id);
        }
        dohvatiUloge();

    }, [korisnik]);

    const dohvatiUloge = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/uloge'); // Dodajte pravilan URL
            setUloge(response.data.uloge);
        } catch (error) {
            console.error('Greška prilikom dohvata uloga', error);
        }
    };

    const handleSubmit = (e) => {
        const azuriraniKorisnik = {
            ime: imeKorisnik,
            prezime:prezimeKorisnik,
            email:emailKorisnik,
            uloga_id:ulogaKorisnik
        };
        updateUser(korisnik.id, azuriraniKorisnik);
        onClose();
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
                <textarea value={prezimeKorisnik} onChange={(e) => setPrezimeKorisnik(e.target.value)}></textarea>
                
                <label>Email:</label>
                <input type="email" value={emailKorisnik} onChange={(e) => setEmailKorisnik(e.target.value)} />
                
                <label>Uloga:</label>
                <select value={ulogaKorisnik} onChange={(e) => setUlogaKorisnik(e.target.value)}>
                    {uloge.map((uloga) => (
                        <option key={uloga.id} value={uloga.id}>{uloga.naziv_uloge}</option>
                    ))}
                </select>
                
                <button type="submit">Ažuriraj korisnika</button>
            </form>
        </div>
        </div>
      );
};

export default UpdateUser;