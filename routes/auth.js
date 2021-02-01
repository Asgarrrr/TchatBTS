// ██████ Integrations ████████████████████████████████████████████████████████

// —— Fast, unopinionated, minimalist web framework for node.

const express = require('express')
// —— Optimized bcrypt in JavaScript with zero dependencies
    , bcrypt = require('bcryptjs')
// —— Express-validator is a set of express.js middlewares that wraps validator.js validator and sanitizer functions.
    , { body, validationResult } = require('express-validator');

// —— Summon an instance of router
const router = express.Router();

/**
 * @param   {Object}    req     - Express request object
 * @param   {Object}    res     - Express response object
 * @param   {Function}  next    - Express next middleware function
 *
 * @description Checks if the user is still authenticated
 */
function isLogged(req, res, next) {

    if (req.session.user) {
        return res.redirect('/');
    }
    next();
}

module.exports = function (io, db) {

    router.get('/', isLogged, function (req, res, next) {

        res.render("auth", {
            title: "auth"
        })

    });

    router.get(['/register', '/login'], isLogged, function (req, res, next) {

        res.render("auth")

    });

    router.post('/register', isLogged, [

        // —— Check POST request data
        body('username', 'Username is Empty!').trim().not().isEmpty(),
        body('username')
        .custom((value, {req, loc, path}) => {

            if (req.body.password !== req.body.cpassword) {
                // —— Throw error if passwords do not match
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
        .custom((value) => {

            if (db.prepare("SELECT `Username` FROM `users` WHERE `Username` = ?").get(value)) {
                return Promise.reject('This user already register!');
            } else {
                return true;
            }
        }),
        body('password', 'The password must be of minimum length 6 characters').trim().isLength({ min: 6 })

    ],
    (req, res) => {

        // —— Finds the validation errors in this request and wraps them in an object with handy functions
        const validation_result = validationResult(req)
            , { username, password } = req.body;

        // —— If all is Ok
        if (validation_result.isEmpty()) {

            // —— Password encryption (using bcryptjs)
            bcrypt.hash(password, 12).then((hash_pass) => {

                // —— Insert new user on database
               try {

                   db.prepare("INSERT INTO `users`(`Username`,`Pass`) VALUES(?, ?)").run(username, hash_pass);

                   // —— Redering auth page with love <3
                    res.render('auth', {
                        succes : "succes"
                    });

                } catch (error) {
                    // —— Launch the insertion of user errors
                    if (error) throw error;
                }

            }).catch(err => {
                if (err) throw err;
            })
        }
        else {
            // —— Collect all the validation errors
            let allErrors = validation_result.errors.map((error) => {
                return error.msg;
            });
            // —— Redering auth page with validation errors
            res.render('auth', {
                register_error: allErrors,
                old_data: req.body
            });
        }
    });

    router.post('/login', isLogged, [

        // —— Check POST request data
        body('username').custom((value) => {

            // —— Check in the database if the user exist
            if (!db.prepare("SELECT `Username` FROM `users` WHERE `Username` = ?").get(value)) {
                return Promise.reject('This user does not exist !');
            } else {
                return true;
            }
        }),
        body('password', 'Password is empty!').trim().not().isEmpty(),
    ], (req, res) => {

        // —— Finds the validation errors in this request and wraps them in an object with handy functions
        const validation_result = validationResult(req)
            , { username, password } = req.body;

        // —— If all is Ok
        if (validation_result.isEmpty()) {

            // —— Retrieve user information
            try {
                const userdata = db.prepare("SELECT * FROM `users` WHERE `Username` = ?").get(username);

                // Checks if the two passwords match
                bcrypt.compare(password, userdata.Pass).then(compare_result => {

                    if (compare_result === true) {

                        // —— Saves in the session the user information (except the password of course).
                        delete (userdata.pass);

                        req.session.isLoggedIn = true;
                        req.session.user = userdata;

                        // —— Redrect to the tchat
                        res.redirect('/');
                    }
                    else {
                        // —— Redering auth page with validation errors
                        res.render('auth', {
                            login_errors: ['Invalid Password!']
                        });
                    }
                })
            } catch (error) {
                if (error) throw error;
            }
        }
        else {
            // —— Collect all the validation errors
            let allErrors = validation_result.errors.map((error) => {
                return error.msg;
            });
            // —— Redering auth page with validation errors
            res.render('auth', {
                login_errors: allErrors
            });
        }
    });

    return router;
};