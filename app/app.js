var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var router = express.Router();
var cors = require('cors')
// put all the functions handeling routes in separated file
var routeFunctions = require('./routes')

app.use(cors());
app.use(bodyParser.json());

router.post("/api/blog/post", routeFunctions.validateJWT, routeFunctions.addNewPost);
router.post("/api/blog/comment", routeFunctions.validateJWT, routeFunctions.addNewComment);
router.post('/api/blog/register', routeFunctions.register);
router.post('/api/blog/login', routeFunctions.login);
router.get('/api/blog/postlist', routeFunctions.getPostList);
router.get('/api/blog/post/:postId/commentlist', routeFunctions.getCommentList);

app.use('/', router);

app.listen(5000, function () {
  console.log("listening on port 5000...")
})