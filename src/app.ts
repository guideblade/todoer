import express from 'express';
const app = express();
const port = 3000;

app.use(express.static('public')); // Serving static files from the 'public' folder

app.get('/', (req, res) => {
  res.send('Hello Worldddd!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
