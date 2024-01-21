import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserDetail = () => {
    const [korisnik, setKorisnik] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const dohvatiDetaljeKorisnika = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/korisnici/${id}`);
                if (response.data) {
                    setKorisnik(response.data);
                } else {
                    console.error('Greška: Nije moguće dohvatiti detalje korisnika');
                }
            } catch (error) {
                console.error('Greška prilikom dohvata detalja korisnika', error);
            }
        };

        if (id) {
            dohvatiDetaljeKorisnika();
        }
    }, [id]);

    if (!korisnik) {
        return <div>Učitavanje detalja korisnika...</div>;
    }

    return (
        <div>
            <h2>Detalji Korisnika</h2>
            <p>Ime: {korisnik.ime}</p>
            <p>Prezime: {korisnik.prezime}</p>
            <p>Email: {korisnik.email}</p>
            <p>Uloga: {korisnik.naziv_uloge}</p>
            <p>Prava pristupa: {korisnik.prava_pristupa.join(', ')}</p>
        </div>
    );
};

export default UserDetail;
