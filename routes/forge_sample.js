const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
    res.send('forge_sample 이후 url');
})

router.get('/test01', (req, res)=>{
    res.send('forge_sample  test01 이후 url');
})
module.exports = router;
