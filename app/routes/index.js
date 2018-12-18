var sqlite3 = require('sqlite3');
var jwt = require('jsonwebtoken');

const secretKey = 'just a simple jwt';

// middleware to handle the JWT verification
let validateJWT = function (req, res, next) {
  let jwtString = req.get('Authorization');
  if (jwtString.length > 6 && jwtString.slice(0, 7).toUpperCase() === 'BEARER ') {
    jwtString = jwtString.slice(7);
  } else if (jwtString.length > 3 && jwtString.slice(0, 4).toUpperCase() == 'JWT ') {
    jwtString = jwtString.slice(4);
  }
  try {
    var decoded = jwt.verify(jwtString, secretKey);
    req.username = decoded.username;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      res.status(401).send('Unauthorized access');
    } else if (err.name === 'TokenExpiredError') {
      res.status(401).send('Token is not valid');
    }
    console.log(err);
  }
};

// handler to support register new user
let register = function (req, res) {
  const inputData = req.body;

  var db = new sqlite3.Database('Blog.db', function () {
    db.all(`SELECT * FROM User 
    WHERE username = ?;`, inputData.username, function (err, rows) {
      if (!err) {
        if (rows.length === 0) {
          db.run(`INSERT INTO User (username, password) VALUES (?, ?)`, inputData.username, inputData.password, function (err, rows) {
            res.json({
              "status": "success",
              "msg": "succeed!"
            });
          });
        } else {
          res.status(401).json({
            "status": "failure",
            "msg": "username taken!"
          });
        }
      } else {
        console.log(err);
      }
    });
  });
};

// handler to support login an user
let login = function (req, res) {
  const inputData = req.body;

  var db = new sqlite3.Database('Blog.db', function () {
    db.all(`SELECT * FROM User 
    WHERE username = ? AND password = ?;`, inputData.username, inputData.password, function (err, rows) {
      if (!err) {
        if (rows.length === 1) {
          var token = jwt.sign({
            username: inputData.username
          }, secretKey, {
            expiresIn: '1h'
          });

          res.json({
            "access_token": token
          });
        } else {
          res.status(401).json({
            "status": "failure",
            "msg": "wrong!"
          });
        }
      } else {
        console.log(err);
      }
    });
  });
};

// handler to support getting the full list of posts
let getPostList = function (req, res) {
  var db = new sqlite3.Database('Blog.db', function () {
    db.all("SELECT * FROM Post;", function (err, rows) {
      if (!err) {
        res.json(rows);
      } else
        console.log(err);
    });
  });
};

// handler to support getting the comment list of a post
let getCommentList = function (req, res) {
  const postId = req.params.postId
  var db = new sqlite3.Database('Blog.db', function () {
    db.all(`SELECT c.body, u.username, c.timestamp FROM Comment c
		LEFT JOIN User u ON
		c.userid = u.id
		WHERE u.id IS NOT NULL
		AND postid = ?`, postId, function (err, rows) {
      if (!err) {
        res.json(rows);
      } else
        console.log(err);
    });
  });
};

// handler to support adding a new post
let addNewPost = function (req, res) {
  const inputData = req.body;
  var db = new sqlite3.Database('Blog.db', function () {
    db.get(`SELECT id FROM User WHERE username = ?`, req.username, function (err, row) {
      if (!err) {
        db.run(`INSERT INTO Post (title, body, category, userid, timestamp) VALUES (?, ?, ?, ?, ?)`,
          inputData.title,
          inputData.body,
          inputData.category,
          row.id,
          new Date().toISOString(),
          function (err, rows) {
            res.json({
              "status": "success",
              "msg": "succeed!"
            });
          });
      } else {
        console.log(err);
      }
    });
  });
};

// handler to support adding a comment for a post
let addNewComment = function (req, res) {
  const inputData = req.body;
  var db = new sqlite3.Database('Blog.db', function () {
    db.get(`SELECT id FROM User WHERE username = ?`, req.username, function (err, row) {
      if (!err) {
        db.run(`INSERT INTO Comment (body, userid, postid, timestamp) VALUES (?, ?, ?, ?)`,
          inputData.comment,
          row.id,
          inputData.postId,
          new Date().toISOString(),
          function (err, rows) {
            res.json({
              "status": "success",
              "msg": "succeed!"
            });
          });
      } else {
        console.log(err);
      }
    });
  });
};

module.exports.validateJWT = validateJWT
module.exports.register = register
module.exports.login = login
module.exports.getPostList = getPostList
module.exports.getCommentList = getCommentList
module.exports.addNewPost = addNewPost
module.exports.addNewComment = addNewComment