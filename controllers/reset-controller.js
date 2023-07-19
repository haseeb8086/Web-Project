const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const productsModel = require('../models/auth-model');

// sendgridTransport() returns a configuration nodemailer can use to use SendGrid
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'f190926@cfd.nu.edu.pk',
    pass: 'F@st@926',
  },
});

exports.getResetPassword = (req, res) => {
  res.render('reset-password', {
    pageTitle: 'Signup',
    authError: req.flash('authError')[0],
    validationErrors: req.flash('validationErrors'),
    isUser: req.session.userId,
    isAdmin: false,
  });
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return redirect('/reset-password');
    }
    // Passing `hex` because buffer stores hexadecimal values, and toString() needs that info to convert to ASCII characters
    // Will look for token from URL in database to confirm password reset link was sent by app/server
    const token = buffer.toString('hex');
    // From password reset page email field
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash(
            'error',
            'No account with the provided email address exists.'
          );
          return res.redirect('/reset-password');
        }
        user.resetToken = token;
        // 3600000 ms = 1 hour
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'f190926@cfd.nu.edu.pk',
          subject: 'Password reset',
          html: `
            <p>We received your ATSHOP account password reset request.</p>
            <p>To set a new password, use this <a href="http://localhost:3000/reset-password/${token}">link</a>.</p>
            <p>If you did not submit a request to change your password, please disregard this message.</p>
          `,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  // Check whether there is a user for token in URL and that token is not expired. $gt operator: greater than
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      // This will be the case if a password reset link is clicked after it was already used, since resetToken and resetTokenExpiration fields are set to undefined after password is reset. Also displayed if random text entered in place of token in reset password page URL
      if (!user) {
        req.flash(
          'error',
          'Invalid password reset link. To reset your password, submit a new request.'
        );
        return res.redirect('/login');
      }
      let message = req.flash('error');
      message.length > 0 ? (message = message[0]) : (message = null);
      res.render('new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
        isAdmin: req.session.isAdmin,
        isUser: req.session.userId,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const { userId, passwordToken } = req.body;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return newPassword;
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      transporter.sendMail({
        to: resetUser.email,
        from: 'cardotmedia@gmail.com',
        subject: 'Password reset successful',
        html: `<p>Your Node Shop password has been changed.</p>`,
      });

      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
