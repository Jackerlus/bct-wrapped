var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/bct-wrapped/', function(req, res, next) {
  res.sendFile('index.html', {
    root: 'public'
  });
});

module.exports = router;