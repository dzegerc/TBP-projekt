import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminMenu from './AdminMenu';
import ModeratorMenu from './ModeratorMenu';
import UpdateTask from './UpdateTask';
import './TaskPage.css';

const TaskPage = () => {
  const [taskovi, setTaskovi] = useState([]);
  const [greska, setGreska] = useState('');
  const [uloga, setUloga] = useState(''); 
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const dohvatiTaskove = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Token nije pronađen u lokalnoj pohrani');
          return;
        }
    
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const response = await axios.get('http://localhost:3001/api/tasks', config);
        setTaskovi(response.data);
      } catch (error) {
        if (error.response) {
         
          setGreska('Greška: ' + error.response.data.poruka);
        } else {
          setGreska('Došlo je do problema pri dohvatu taskova.');
        }
      }

      setUloga(localStorage.getItem('uloga'));

    };

    dohvatiTaskove();
  }, [uloga]);

  const postaviTrenutniTask = (task) => {
    setSelectedTask(task);
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.put(`http://localhost:3001/api/tasks/${taskId}`, taskData, config);
      // Osvježavanje liste taskova nakon uspješnog ažuriranja
      const response = await axios.get('http://localhost:3001/api/tasks', config);
      setTaskovi(response.data);
    } catch (error) {
      console.error('Došlo je do greške prilikom ažuriranja taska:', error);
    }
  };
  
  return (
    <div>
    {uloga === 'Administrator' && <AdminMenu/>} 
    {uloga === 'Moderator' && <ModeratorMenu/>}
    <h2>Lista Taskova</h2>
    {taskovi.length > 0 ? (
      taskovi.map(task => (
        <div key={task.id} className="taskovi">
          <div className='task'>
            <h3>{task.naziv_taska}</h3>
            <p>{task.opis_taska}</p>
            <p>Početak: {task.datum_pocetka}</p>
            <p>Završetak: {task.datum_zavrsetka}</p>
            <button onClick={() => postaviTrenutniTask(task)}>Ažuriraj</button>
          </div>
          <UpdateTask 
              isOpen={selectedTask !== null} 
              onClose={() => setSelectedTask(null)}
              task={selectedTask || {}} 
              updateTask={handleUpdateTask}
          />

        </div>
        
      ))
    ) : (
      <p>Nema dostupnih taskova.</p>
    )}
  </div>
  );
};

export default TaskPage;
