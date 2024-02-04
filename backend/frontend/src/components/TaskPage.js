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
        console.log('Token iz localStorage-a:', token);
        if (!token) {
          console.log('Token nije pronađen u lokalnoj pohrani');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const response = await axios.get('http://localhost:3001/api/tasks', config);
        setTaskovi(response.data.map(task => {
          // Dodajte kod za obradu datuma ovdje
          const vremenskiOkvir = task.vremenski_okvir;
          const match = vremenskiOkvir.match(/\((.*?),(.*?)\)/);
          if (match) {
            const pocetak = new Date(match[1]);
            const zavrsetak = new Date(match[2]);
            return { ...task, pocetak, zavrsetak };
          }
          return task;
        }));
        console.log('Taskovi s servera:', response.data);
      } catch (error) {
        if (error.response) {
          setGreska('Greška: ' + error.response.data.poruka);
        } else {
          setGreska('Došlo je do problema pri dohvatu taskova.');
        }
      }

      const uloga = localStorage.getItem('uloga');
      console.log('Uloga iz localStorage-a:', uloga);
      setUloga(uloga);
    };

    dohvatiTaskove();
  }, []);

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
      setTaskovi(response.data.map(task => {
        const vremenskiOkvir = task.vremenski_okvir;
        const match = vremenskiOkvir.match(/\((.*?),(.*?)\)/);
        if (match) {
          const pocetak = new Date(match[1]);
          const zavrsetak = new Date(match[2]);
          return { ...task, pocetak, zavrsetak };
        }
        return task;
      }));
      setSelectedTask(null); // Zatvaranje prozora za ažuriranje nakon uspješnog ažuriranja
    } catch (error) {
      console.error('Došlo je do greške prilikom ažuriranja taska:', error);
    }
  };

  return (
    <div>
      {uloga === 'Administrator' && <AdminMenu />}
      {uloga === 'Moderator' && <ModeratorMenu />}
      <h2>Lista Taskova</h2>
      {taskovi.length > 0 ? (
        taskovi.map((task) => (
          <div key={task.id} className="taskovi">
            <div className="task">
              <h3>{task.naziv_taska}</h3>
              <p>{task.opis_taska}</p>
              <p>Početak: {task.pocetak && task.pocetak.toLocaleDateString()}</p>
              <p>Završetak: {task.zavrsetak && task.zavrsetak.toLocaleDateString()}</p>
              {(uloga === 'Administrator' || uloga === 'Moderator') && (
                <button onClick={() => postaviTrenutniTask(task)}>Ažuriraj</button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>Nema dostupnih taskova.</p>
      )}
      <UpdateTask
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        task={selectedTask || {}}
        updateTask={handleUpdateTask}
      />
    </div>
  );
};

export default TaskPage;
