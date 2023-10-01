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

  const fileBuffer = req.file.buffer.toString();
  const results = [];

  // Process the CSV data (you can use csv-parser or other libraries for parsing)
  csv({ headers: true })
    .toString(fileBuffer)
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // At this point, `results` contains your CSV data as an array of objects
      // You can process the data or save it to a database
      const firstRow = results.length > 0 ? results[0] : {};
      res.status(200).json(firstRow);
    });
});

app.post('/select-columns', (req, res) => {
    const { selectedColumns } = req.body; // Assuming selectedColumns is an array of column indices
    const fileBuffer = req.file.buffer.toString();
    const results = [];
  
    // Process the CSV data (you can use csv-parser or other libraries for parsing)
    csv({ headers: true })
      .toString(fileBuffer)
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Extract selected columns
        const selectedData = results.map((row) =>
          selectedColumns.map((index) => row[index])
        );
  
        // Send the selected columns data as JSON response
        res.status(200).json(selectedData);
      });
  });  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});