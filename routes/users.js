const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const jwt = require('jsonwebtoken');
var upload = multer({ dest: 'uploads/' });

const cloudinary = require('cloudinary').v2;

//Cloudinary Configuration
cloudinary.config({
	cloud_name: 'diksrk8se',
	api_key: '567221595234463',
	api_secret: '8tF1Av0aTnp_HzkdwQGD17Va474'
})

// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res, next) => {
	res.render('register');
});

// Register
router.post('/register', upload.single('image'), async (req, res) => {
	const result = await cloudinary.uploader.upload(req.file.path);
	const imageUrl = result.url;
	const { name, email, password, password2 } = req.body;
	let errors = [];

	if (!name || !email || !password || !password2) {
		errors.push({ msg: 'Please enter all fields' });
	}

	if (password != password2) {
		errors.push({ msg: 'Passwords do not match' });
	}

	if (password.length < 6) {
		errors.push({ msg: 'Password must be at least 6 characters' });
	}

	if (errors.length > 0) {
		res.render('register', {
			errors,
			name,
			email,
			password,
			password2
		});
	} else {
		User.findOne({ email: email }).then(user => {
			if (user) {
				errors.push({ msg: 'Email already exists' });
				res.render('register', {
					errors,
					name,
					email,
					password,
					password2
				});
			} else {
				const newUser = new User({
					name,
					email,
					password,
					imageUrl: imageUrl
				});

				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						newUser
							.save()
							.then(user => {
								req.flash(
									'success_msg',
									'You are now registered and can log in'
								);
								res.redirect('/users/login');
							})
							.catch(err => console.log(err));
					});
				});
			}
		});
	}
});


// Login
router.post('/login', passport.authenticate('local', {
	successRedirect: '/dashboard',
	failureRedirect: '/users/login',
	failureFlash: false
}), function (req, res, next) {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (err) {
			res.send(err);
		} else {
			res.render('dashboard', {
				data: data
			})
		}
	})
});

// Logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/login');
});

//View Profile
router.get('/profile/:id', (req, res, next) => {
	var data;
	User.findOne({ _id: req.params.id }, (err, user) => {
		if (err) {
			res.render('error', {
				message: err
			})
		} else {
			res.render('profile', {
				data: user
			})
		}
	})
})

module.exports = router;