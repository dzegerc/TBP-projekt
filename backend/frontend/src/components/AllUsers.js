import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllUsers.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import UpdateUser from './UpdateUser';


const SviKorisnici = () => {
    const [korisnici, setKorisnici] = useState([]);
    const [odabraniKorisnik, setOdabraniKorisnik] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const dohvatiSveKorisnike = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get('http://localhost:3001/api/korisnici', config);
        setKorisnici(response.data);
      } catch (error) {
        console.error('Greška prilikom dohvata korisnika', error);
      }
    };
    
    useEffect(() => {
      dohvatiSveKorisnike();
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

    const openEditModal = () => {
      setIsModalOpen(false); 
      setIsEditModalOpen(true); 
      console.log("Edit modal opened"); 

    };

    const handleUpdateUser = async (id, updatedUserData) => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('Token nije pronađen u lokalnoj pohrani');
            return;
          }
  
          const config = {
            headers: { Authorization: `Bearer ${token}` }
          };
  
          const response = await axios.put(`http://localhost:3001/api/korisnici/${id}/uloga`, updatedUserData, config);
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }
      
          dohvatiSveKorisnike(); 
      } catch (error) {
          console.error('Greška prilikom ažuriranja korisnika', error);
     
      }
  };
  

    const Modal = ({ korisnik, zatvoriModal }) => (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={zatvoriModal}>&times;</span>
          <h2>Detalji Korisnika</h2>
          <p>Ime: {korisnik.ime}</p>
          <p>Prezime: {korisnik.prezime}</p>
          <p>Email: {korisnik.email}</p>
          <p>Uloga: {korisnik.naziv_uloge}</p>
          <button onClick={openEditModal}> Uredi </button>
        </div>
      </div>
    );
  
  

    return (
        <div>
          <h1>Svi Korisnici</h1>
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
         {isEditModalOpen && (
          <UpdateUser
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            korisnik={odabraniKorisnik}
            updateUser={handleUpdateUser}
          />
        )}
        </div>
      );
  };
export default SviKorisnici;
