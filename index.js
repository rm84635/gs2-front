const fs = require('fs');
const express = require('express');
const Mustache = require('mustache');
const axios = require('axios');

const app = express();
const port = 1337;

const baseURL = 'http://localhost:8080';

const config = {
  headers: {
    'Content-Type': 'application/json'
  },

  auth: {
    username: 'julio',
    password: 'facal'
  }
};

function getAmbientes() {
  return axios.get(`${baseURL}/ambiente`, config);
}

function getVeiculos() {
  return axios.get(`${baseURL}/veiculo`, config);
}

function renderTemplate(name, data) {
  return Mustache.render(
    fs.readFileSync(`./src/templates/${name}.mustache`).toString(),
    data
  );
}

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));

app.get('/', (_, res) => {
  Promise.all([getAmbientes(), getVeiculos()])
    .then(function(results) {
      const ambientes = results[0].data;
      const veiculos = results[1].data;

      res.send(renderTemplate('index', {
        ambientes: ambientes,
        veiculos: veiculos,
        mostrar_form_veiculos: ambientes.length > 0
      }));
    });
});

app.get('/delete/ambiente/:id', (req, res) => {
  axios.delete(`${baseURL}/ambiente/${req.params.id}`, config);
  res.redirect('/');
});

app.get('/delete/veiculo/:id', (req, res) => {
  axios.delete(`${baseURL}/veiculo/${req.params.id}`, config);
  res.redirect('/');
});

app.post('/ambiente', (req, res) => {
  axios.post(`${baseURL}/ambiente`, req.body, config);
  res.redirect('/');
});

app.post('/veiculo', (req, res) => {
  axios.get(`${baseURL}/ambiente/${req.body.ambiente}`, config)
    .then(response => {
      req.body.ambiente = response.data;
      axios.post(`${baseURL}/veiculo`, req.body, config);
    });

  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Executando na porta ${port}`);
});
