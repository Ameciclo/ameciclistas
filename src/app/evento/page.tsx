'use client'
import { useState } from 'react';

const CreateEventPage = () => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [calendar, setCalendar] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      title,
      startTime,
      duration,
      location,
      description,
      calendar,
    };
    console.log('Event Data:', eventData);
    // Aqui você pode adicionar a lógica para salvar os dados do evento
  };

  return (
    <div>
      <h1>Criar Evento</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Título do Evento:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="startTime">Horário de Início:</label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="duration">Duração (em horas):</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="location">Local:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Descrição:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="calendar">Seletor de Agenda:</label>
          <input
            type="text"
            id="calendar"
            value={calendar}
            onChange={(e) => setCalendar(e.target.value)}
            required
          />
        </div>
        <button type="submit">Criar Evento</button>
      </form>
    </div>
  );
};

export default CreateEventPage;
