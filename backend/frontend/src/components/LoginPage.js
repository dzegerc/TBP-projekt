import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const navigate = useNavigate();

  const handlePrijaviSe = async () => {
    
    localStorage.removeItem('token');
    localStorage.removeItem('uloga');

    try {
      const response = await axios.post('http://localhost:3001/api/prijava', {
        email,
        lozinka,
      });
  
      if(response.data.uspjeh) {
       
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('uloga', response.data.uloga);
  
        console.log('Uspješna prijava', response.data);
        
        if (response.data.uloga === 'Administrator' || response.data.uloga === 'Moderator' || response.data.uloga === 'Običan korisnik') {
          navigate('/tasks');
        } else {
          navigate('/home');
        }
      } else {
        console.error('Prijava nije uspjela');
      }
    } catch (error) {
      console.error('Neuspješna prijava', error);
    }
  };
  

  return (
    <div className='container'>
       <div className='naslov'>
          <p>Task Manager</p>
      </div>
      <form className='form'>
      <h2>PRIJAVA</h2>
        <label className='label'>
          Email:
          <input className='input' type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <br />
        <label className='label'> 
          Lozinka:
          <input className='input2' type="password" value={lozinka} onChange={(e) => setLozinka(e.target.value)} />
        </label>
        <br />
        <button className='button' type="button" onClick={handlePrijaviSe}>
          Prijavi se
        </button>
      </form>
    </div>
  );
};

export default LoginPage;