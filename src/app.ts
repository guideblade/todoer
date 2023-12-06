import express from 'express';
import path from 'path';

const app = express();
const port = 3000;

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('../views', path.join(__dirname, 'views')); // Set the views directory (create a 'views' folder)

app.use(express.static('public'));

app.get('/', (req, res) => {
  const variableMessage = 'Dynamic Message from Backend!';
  res.render('index', { message: variableMessage }); // Render the 'index' view with the variable
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
