const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const blogController = require('../controller/blogController');
const Users = require('../models/User');
const Posts = require('../models/Post');


// Home Page
router.get('/', (req, res) => {
	Posts.find(function (err, data) {
		res.render('index', {
			data: data,
		});
	});
});

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));
router.get('/blog', (req, res, next) => {
	Posts.find(function (err, data) {
		res.render('index', {
			data: data
		});
	});
});

router.post('/posts/add', ensureAuthenticated, (req, res, next) => {
	const post = new Posts({
		title: req.body.title,
		content: req.body.content,
		date: Date(),
		user: req.user
	});


	post.save((err, data) => {
		if (err) {
			res.render('dashboard', {
				message: 'Sorry, Something went wrong!',
				data: req.user
			});
		} else {
			res.render('dashboard', {
				message: 'Post Successfully Added',
				data: req.user
			})
		}
	})

})

router.get('/posts/edit', ensureAuthenticated, (req, res, next) => {
	Posts.find({ user: req.user }, (err, data) => {
		if (err) {
			res.send(err)
		} else {
			res.render('edit', {
				data: data,
				user: req.user
			})
		}
	});
})

router.get('/posts/edit/:id', (req, res, next) => {
	Posts.findOne({ _id: req.params.id }, (err, data) => {
		if (err) {
			res.send(err);
		} else {
			res.render('editPost', {
				data: data,
				message: ''
			})
		}
	})
})

router.post('/posts/edit/:id', (req, res, next) => {
	Posts.findOne({ _id: req.params.id }, (err, data) => {
		if (err) {
			res.send(err);
		} else {
			Posts.updateOne({ title: req.body.title, content: req.body.content }, (err, data) => {
				res.send("UPDATED")
			})
		}
	})
})

router.get('/posts/:id', (req, res, next) => {
	Posts.findOne({ _id: req.params.id }, (err, data) => {
		if (err) {
			res.send(err);
		} else {
			res.render('post', {
				data: data
			})
		}
	})
});

//Get all posts in Json format
router.get('/posts', ensureAuthenticated, (req, res, next) => {
	Posts.find((err, data) => {
		if (err) {
			res.send(err);
		} else {
			res.send(data)
		}
	});
})

//About Page Router
router.get('/about', (req, res, next) => {
	res.render('about')
})

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
	if (req.user) {
		Users.findOne({ email: req.user.email }, (err, data) => {

			res.render('dashboard', {
				data: data,
				isLogin: true,
				message: ''
			})
		})
	} else {
		res.render('dashboard', {
			data: data,
			isLogin: false,
			message: ''
		})
	}
});

module.exports = router;
