var express = require('express');
var router = express.Router();

let Article = require('../models/article');
let User = require('../models/user');
//Add route

router.get('/add',ensureAuthenticated, function(req, res) {
    res.render('add_article', {
        title: 'Add Article'
    });
});

//Add submit POST route
router.post('/add', function(req, res) {

    req.checkBody('title', 'Title is Required!').notEmpty();
    //req.checkBody('author', 'Author is Required!').notEmpty();
    req.checkBody('body', 'Body is Required!').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        var article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
        article.save(function(err) {
            if (err)
                console.log(err);
            else {
                req.flash('success', 'Article Added Successfully!');
                res.redirect('/');
            }
        });
    }
});

//Add edit article route
router.get('/edit/:id',ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if(article.author != req.user._id)
        {
            req.flash('danger','Not Authorized!');
            res.redirect('/');
        }
        else
        {
        res.render('edit_article', {
            article: article,
            title: 'Edit Article'
        });
    }
    });
});


router.post('/edit/:id', function(req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {
        _id: req.params.id
    };
    Article.updateOne(query, article, function(err) {
        if (err)
            console.log(err);
        else {
            req.flash('success', 'Article Updated Successfully!');
            res.redirect('/');
        }
    });
});

//Add single article route
router.get('/:id', function(req, res) {

    Article.findById(req.params.id, function(err, article) {
        User.findById(article.author,function(err,user){
            res.render('article', {
                article: article,
                author:user.name
            });
        });

    });
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}
module.exports = router;
