import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// GET endpoint for schema files
app.get('/schemas/:schema_name.json', async (req, res) => {
  try {
    const schemaName = req.params.schema_name;
    const schemaPath = path.join(__dirname, 'schemas', `${schemaName}.json`);
    
    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaContent);
      res.json(schema);
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ error: `Schema '${schemaName}' not found` });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error serving schema:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Schema server listening at http://localhost:${port}`);
});