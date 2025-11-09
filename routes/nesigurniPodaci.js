const express = require('express');
const router = express.Router();
const db = require('./db');

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const hash = crypto.createHash('sha256');

router.get('/', async (req, res) => {
    const formData = req.session.formData || null;
    delete req.session.formData;
    res.render('nesigurniPodaci', {formData});
});

function encrypt(text, key) {
    const iv = crypto.randomBytes(16); // Initialization vector
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Return IV and encrypted text
}

router.post('/', async (req, res) => {
  try {
    const { ranjivost, ime, prezime, email, lozinka } = req.body;
    if (!ime || !prezime || !email || !lozinka){
        return res.status(400).send('Nedostaje ime, prezime, email ili lozinka korisnika.');
    }
    if (ranjivost) {
        const formData = {eHash: email, encryptedData: ime+prezime+email, hashedPass: lozinka};
        req.session.formData = formData;
    } else {
        const hashedPass = await bcrypt.hash(lozinka, saltRounds);
        hash.update(email);
        const eHash = hash.digest('hex');
        const key = crypto.randomBytes(32); // Generate a secure key
        const encryptedData = encrypt(ime+prezime+email, key);
        const formData = {eHash: eHash, encryptedData: encryptedData, hashedPass: hashedPass};
        req.session.formData = formData;
    }
    res.redirect('/nesigurniPodaci');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Greška prilikom registracije.' });
  }
});

module.exports = router;