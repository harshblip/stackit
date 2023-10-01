const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;

    const results = [];

    // Process the CSV data using csv-parser
    csv({ headers: true })
        .on('data', (data) => results.push(data))
        .on('end', () => {
            const dataMatrix = results.map((row) => Object.values(row));
            const firstRow = dataMatrix.length > 0 ? dataMatrix[0] : {};

            res.status(200).json(firstRow);
        })
        .write(fileBuffer);
});

app.post('/select-columns', (req, res) => {
    const { selectedColumns } = req.body; 
    const fileBuffer = req.file.buffer.toString();
    const results = [];

    csv({ headers: true })
        .toString(fileBuffer)
        .on('data', (data) => results.push(data))
        .on('end', () => {
            const selectedData = results.map((row) =>
                selectedColumns.map((index) => row[index])
            );

            res.status(200).json(selectedData);
        });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});