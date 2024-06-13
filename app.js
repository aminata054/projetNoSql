const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/DBLP?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.6', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const collectionName = 'publis';


const Publis = mongoose.model('Publis', {
  _id: String,
  type: String,
  title: String,
  pages: {
    start: Number,
    end: Number,
  },
  year: Number,
  booktitle: String,
  url: String,
  authors: [{ type: String }]
});

app.use(express.static('public'));

app.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    const publis = await Publis.find().skip(skip).limit(limit).exec();
    const count = await Publis.countDocuments().exec();
    const pages = Math.ceil(count / limit);

    const pagination = [];
    if (page > 1) {
      pagination.push(`<li class="page-item"><a class="page-link" href="?page=${page - 1}">Précédent</a></li>`);
    }
    for (let i = Math.max(1, page - 2); i <= Math.min(page + 2, pages); i++) {
      pagination.push(`<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="?page=${i}">${i}</a></li>`);
    }
    if (page < pages) {
      pagination.push(`<li class="page-item"><a class="page-link" href="?page=${page + 1}">Suivant</a></li>`);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Publis - Collection</title>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
        </head>
        <body>
          <div class="container">
            <h1 class="text-center">Publis - Collection</h1>
            <table class="table table-striped">
              <tr>
                <th>Type</th>
                <th>Titre</th>
                <th>Pages</th>
                <th>Année</th>
                <th>Booktitle</th>
                <th>URL</th>
                <th>Auteurs</th>
              </tr>
              ${publis.map(item => `
                <tr>
                  <td>${item.type}</td>
                  <td>${item.title}</td>
                  <td>${item.pages.start} - ${item.pages.end}</td>
                  <td>${item.year}</td>
                  <td>${item.booktitle}</td>
                  <td><a href="${item.url}">${item.url}</a></td>
                  <td>${item.authors.join(', ')}</td>
                </tr>
              `).join('')}
            </table>
            <ul class="pagination">
              ${pagination.join('')}
            </ul>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});