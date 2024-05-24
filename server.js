const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

const fs = require('fs');


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const cron = require('node-cron');



mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const complaintSchema = new mongoose.Schema({
  category: String,
  description: String,
  location: String,
  photo: String,
  date: { type: Date, default: Date.now }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

app.use(bodyParser.json());

app.post('/submit-complaint', async (req, res) => {
  const { category, description, location, photo } = req.body;
  try {
    const complaint = new Complaint({ category, description, location, photo });
    await complaint.save();
    res.status(201).json({ message: 'Complaint submitted successfully!' });
  } catch (err) {
    console.error('Error submitting complaint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort('-date').exec();
    res.json(complaints);
  } catch (err) {
    console.error('Error retrieving complaints:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use(express.static('public'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});


// Function to fetch complaints from MongoDB
async function fetchComplaints() {
    try {
        const complaints = await Complaint.find().sort('-date').exec();
        return complaints;
    } catch (err) {
        console.error('Error retrieving complaints:', err);
        throw err;
    }
}

// Function to save complaints to a text file
async function saveComplaintsToFile() {
    try {
        const complaints = await fetchComplaints();
        const complaintData = complaints.map(complaint => ({
            category: complaint.category,
            description: complaint.description,
            location: complaint.location,
            photo: complaint.photo,
            date: complaint.date
        }));
        const filePath = path.join(__dirname, 'complaints.txt');
        fs.writeFileSync(filePath, JSON.stringify(complaintData, null, 2));
        console.log('Complaints saved to complaints.txt');
    } catch (err) {
        console.error('Error saving complaints to file:', err);
    }
}

// Call the function to save complaints to file
saveComplaintsToFile();

// Define a cron job to run saveComplaintsToFile function every day at midnight
cron.schedule('0 0 * * *', () => {
  saveComplaintsToFile();
});
