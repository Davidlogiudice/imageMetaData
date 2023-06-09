const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const resultsFolder = 'results';
const port = 3000;

if (!fs.existsSync(resultsFolder)) {
  fs.mkdirSync(resultsFolder);
}

app.use(express.static('public'));

app.post('/upload', upload.single('image'), (req, res) => {
  const originalName = req.file.originalname;
  const tempFilePath = req.file.path;
  const destinationFolder = 'uploads/';

  const destinationFilePath = path.join(destinationFolder, originalName);

  fs.rename(tempFilePath, destinationFilePath, (error) => {
    if (error) {
      console.error('Error moving uploaded file:', error);
      res.sendStatus(500);
    } else {
      console.log('File uploaded successfully:', destinationFilePath);
      const completeFilePath = path.resolve(destinationFilePath); // Get the complete file path
      extractMetadata(completeFilePath, (error, metadata) => {
        if (error) {
          console.error('Error extracting metadata:', error);
          res.sendStatus(500);
        } else {
          const outputFilePath = path.join(resultsFolder, `${metadata.filename}.json`);
          saveMetadataAsJson(metadata, outputFilePath);
          res.sendStatus(200);
        }
      });
    }
  });
});

function extractMetadata(filePath, callback) {
  try {
    const filename = path.parse(filePath).name;
    const format = path.extname(filePath).toLowerCase();
    const stats = fs.statSync(filePath);
    const sizeInBytes = stats.size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';

    const metadata = {
      filename,
      format,
      size: sizeInMB,
    };

    callback(null, metadata);
  } catch (error) {
    console.error('Error extracting metadata:', error);
    callback(error, null);
  }
}

function saveMetadataAsJson(metadata, outputFilePath) {
  const json = JSON.stringify(metadata, null, 2);
  fs.writeFile(outputFilePath, json, (error) => {
    if (error) {
      console.error('Error saving metadata as JSON:', error);
    } else {
      console.log('Metadata saved as JSON:', outputFilePath);
    }
  });
}

function getUploadedImages(callback) {
  fs.readdir('uploads/', (error, files) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, files);
    }
  });
}

app.get('/images', (req, res) => {
  getUploadedImages((error, images) => {
    if (error) {
      console.error('Error retrieving uploaded images:', error);
      res.sendStatus(500);
    } else {
      res.json(images);
    }
  });
});

app.get('/metadata/:filename', (req, res) => {
  const filename = req.params.filename;
  const jsonPath = path.join(resultsFolder, `${filename}.json`);

  fs.readFile(jsonPath, 'utf8', (error, data) => {
    if (error) {
      console.error('Error reading metadata JSON:', error);
      res.sendStatus(500);
    } else {
      const metadata = JSON.parse(data);
      res.json(metadata);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
