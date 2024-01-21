import React, { useState, useEffect } from 'react';
import  './UpdateTask.css';

const UpdateTask = ({ isOpen, onClose, task, updateTask }) => {
    const [nazivTaska, setNazivTaska] = useState(task.naziv_taska);
    const [opisTaska, setOpisTaska] = useState(task.opis_taska);
    const [datumPocetka, setDatumPocetka] = useState(task.datum_pocetka);
    const [datumZavrsetka, setDatumZavrsetka] = useState(task.datum_zavrsetka);

    useEffect(() => {
        setNazivTaska(task.naziv_taska);
        setOpisTaska(task.opis_taska);
        setDatumPocetka(task.datum_pocetka);
        setDatumZavrsetka(task.datum_zavrsetka);
    }, [task]);

    const handleSubmit = (e) => {
        const azuriraniTask = {
            naziv_taska: nazivTaska,
            opis_taska: opisTaska,
            datum_pocetka: datumPocetka,
            datum_zavrsetka: datumZavrsetka
        };
        updateTask(task.id, azuriraniTask);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <label>Naziv Taska:</label>
                    <input type="text" value={nazivTaska} onChange={(e) => setNazivTaska(e.target.value)} />
                    
                    <label>Opis Taska:</label>
                    <textarea value={opisTaska} onChange={(e) => setOpisTaska(e.target.value)}></textarea>
                    
                    <label>Datum Početka:</label>
                    <input type="date" value={datumPocetka} onChange={(e) => setDatumPocetka(e.target.value)} />
                    
                    <label>Datum Završetka:</label>
                    <input type="date" value={datumZavrsetka} onChange={(e) => setDatumZavrsetka(e.target.value)} />
                    
                    <button type="submit">Ažuriraj Task</button>
                </form>
            </div>
        </div>
    );
};

export default UpdateTask;
