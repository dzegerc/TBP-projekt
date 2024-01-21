import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';


const Modal = ({ korisnik, zatvoriModal }) => (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={zatvoriModal}>&times;</span>
        <h2>Detalji Korisnika</h2>
        <p>Ime: {korisnik.ime}</p>
        <p>Prezime: {korisnik.prezime}</p>
        <p>Email: {korisnik.email}</p>
        <p>Uloga: {korisnik.naziv_uloge}</p>
        <p>Prava pristupa: {korisnik.prava_pristupa.join(', ')}</p>
      </div>
    </div>
  );

const MyUsers = () => {
    const [korisnici, setKorisnici] = useState([]);
    const [odabraniKorisnik, setOdabraniKorisnik] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const dohvatiMojeKorisnike = async () => {
      try {
        const token = localStorage.getItem('token');
        const uloga = localStorage.getItem('uloga');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        let url;
          if (uloga === 'Administrator') {
            url = 'http://localhost:3001/api/administrator/korisnici'; 
          } else if (uloga === 'Moderator') {
            url = 'http://localhost:3001/api/moderator/korisnici'; 
          } else {
            console.error('Nepoznata uloga korisnika');
            return;
          }

      const response = await axios.get(url, config);
      setKorisnici(response.data);
    } catch (error) {
      console.error('Greška prilikom dohvata korisnika', error);
    }
  };

    dohvatiMojeKorisnike();
  }, []);

  const handleKorisnikClick = async (id) => {

    try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Token nije pronađen u lokalnoj pohrani');
          return;
        }
    
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
    
        const response = await axios.get(`http://localhost:3001/api/korisnici/${id}`, config);
        setOdabraniKorisnik(response.data.korisnik);
        setIsModalOpen(true);
      } catch (error) {
        console.error('Greška prilikom dohvata detalja korisnika', error);
        
      }
    };
  

    return (
        <div>
          <h1>Moji korisnici</h1>
          {korisnici.map(korisnik => (
            <div className='korisnici' key={korisnik.id}> 
                <div className='korisnik'>
                    <FontAwesomeIcon icon={faUser} />
                    <p>Ime: {korisnik.ime}</p>
                    <p>Prezime: {korisnik.prezime}</p>
                    <button onClick={() => handleKorisnikClick(korisnik.id)}> Više </button>
                </div>
            </div>
          ))}
          {isModalOpen && odabraniKorisnik && (
            <Modal 
              korisnik={odabraniKorisnik} 
              zatvoriModal={() => setIsModalOpen(false)} 
            />
          )}
        </div>
      );
  };
export default MyUsers;
