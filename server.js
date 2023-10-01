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

app.post('/select-columns', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileBuffer = req.file.buffer;
    const { selectedColumns } = req.body; // Assuming selectedColumns is an array of column indices

    if (!Array.isArray(selectedColumns)) {
        return res.status(400).send('Invalid selectedColumns format.');
    }

    const results = [];

    // Process the CSV data using csv-parser
    csv({ headers: true })
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // At this point, `results` contains your CSV data as an array of objects
            // You can process the data or save it to a database

            // Extract selected columns
            const selectedData = results.map((row) =>
                selectedColumns.map((index) => row[index])
            );

            res.status(200).json(selectedData);
        })
        .write(fileBuffer);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});