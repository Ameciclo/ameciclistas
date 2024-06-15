// src/app/evento/page.tsx
"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tabs,
  Tab,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LocationOn, Notes, Palette } from '@mui/icons-material';

const CreateEventPage = () => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [repeat, setRepeat] = useState('');
  const [tab, setTab] = useState(0);
  const [color, setColor] = useState('red');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      title,
      startTime,
      endTime,
      location,
      description,
      allDay,
      repeat,
      tab,
      color,
    };
    console.log('Event Data:', eventData);
    // Aqui você pode adicionar a lógica para salvar os dados do evento
  };

  return (
    <Box className="container">
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', maxWidth: 400 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
          <Tab label="Event" />
          <Tab label="Task" />
          <Tab label="Reminder" />
        </Tabs>
        <TextField
          label="Add title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <FormControl fullWidth margin="normal">
          <label>Start Time</label>
          <DatePicker
            selected={startTime}
            onChange={(date) => setStartTime(date)}
            showTimeSelect
            dateFormat="Pp"
            customInput={<TextField />}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <label>End Time</label>
          <DatePicker
            selected={endTime}
            onChange={(date) => setEndTime(date)}
            showTimeSelect
            dateFormat="Pp"
            customInput={<TextField />}
          />
        </FormControl>
        <FormControlLabel
          control={<Checkbox checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />}
          label="All day"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Repeat</InputLabel>
          <Select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            label="Repeat"
          >
            <MenuItem value="none">Does not repeat</MenuItem>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Location"
          fullWidth
          margin="normal"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          InputProps={{
            startAdornment: <LocationOn />
          }}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          InputProps={{
            startAdornment: <Notes />
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Palette />
          <Box>
            {['red', 'green', 'gold', 'blue', 'cyan', 'purple', 'brown'].map((clr) => (
              <Button
                key={clr}
                sx={{ backgroundColor: clr, minWidth: 24, height: 24, m: 0.5 }}
                onClick={() => setColor(clr)}
              />
            ))}
          </Box>
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default CreateEventPage;
