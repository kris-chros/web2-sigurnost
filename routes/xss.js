const express = require('express');
const router = express.Router();
const db = require('./db');

function sanitize(string) {
  const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}

router.get('/', async (req, res) => {
    try {
      const data = await db.any(
      'SELECT imeKorisnika, naslovObjave, tekstObjave FROM Objave WHERE idTeme = $1;',
      [1]
    );

    //console.log('rows:', data);
    return res.render('xss', { posts: data, brT: 1 });
  } catch (error) {
    console.error('DB ERROR:', error && error.stack ? error.stack : error);
    return res.status(500).send('Database error');
  }
});

router.get('/:id', async (req, res) => {
    try {
      const brTeme = parseInt(req.params.id);
      const data = await db.any(
      'SELECT imeKorisnika, naslovObjave, tekstObjave FROM Objave WHERE idTeme = $1;',
      [brTeme]
      );

    //console.log('rows:', data);
      return res.render('xss', { posts: data, brT: brTeme });
    } catch (error) {
      console.error('DB ERROR:', error && error.stack ? error.stack : error);
      return res.status(500).send('Database error');
    }
});

router.post('/delete', async (req, res) => {
  try {
    const idPost = await db.oneOrNone(
      "SELECT idObjave FROM Objave WHERE LOWER(tekstObjave) LIKE '%<script>%';"
    );
    if (!idPost) {
      return res.json({ message: 'Zapis ne postoji.' });
    }

    await db.none('DELETE FROM Objave WHERE idObjave = $1;', [idPost.idobjave]);

    res.json({ message: 'Uspješno obrisan zapis.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška prilikom brisanja.' });
  }
});

router.post(`/:id`, async (req, res) => {
  try {
    const { ranjivost, name, naslov, tekst } = req.body;
    const brTeme = parseInt(req.params.id);
    if (!name || !tekst || !naslov) {
      return res.status(400).send('Nedostaje ime korisnika, naslov ili tekst objave.');
    }
    const idOb = await db.one(
        `SELECT MAX(idObjave) FROM Objave;`
    );
    var promTekst = '';
    if (!ranjivost) {
      promTekst = sanitize(tekst);
    } else {
      promTekst = tekst;
    }

    await db.none(
      `INSERT INTO Objave (idObjave, imeKorisnika, naslovObjave, tekstObjave, idTeme)
       VALUES ($1, $2, $3, $4, $5);`,
      [parseInt(idOb.max)+1, name, naslov, promTekst, brTeme] 
    );
    res.redirect(`/xss/${brTeme}`);
  } catch (err) {
    console.error('Greska:', err);
    res.status(500).send('Greska prilikom spremanja');
  }
});



module.exports = router;