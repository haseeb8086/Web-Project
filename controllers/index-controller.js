// import the products model

exports.getHome = (req, res, next) => {
  res.render('homeScreen', {
    pageTitle: 'Home',
    isAdmin: req.session.isAdmin,
    isUser: req.session.userId,
  });
};

exports.getaboutUs = (req, res, next) => {
  res.render('aboutUs', {
    pageTitle: 'About',
    isUser: req.session.userId,
  });
};
exports.getcontactUs = (req, res, next) => {
  res.render('contactUs', {
    pageTitle: 'contact',
    isUser: req.session.userId,
  });
};
