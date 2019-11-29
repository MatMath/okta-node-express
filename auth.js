var passport = require('passport'),
  SamlStrategy = require('passport-saml').Strategy,
  config = require('./config.json');

var users = [];

function findByEmail(email, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.email === email) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(id, done) {
  findByEmail(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new SamlStrategy(
  {
    issuer: "http://www.okta.com/exk21qym6tbDhKwK9357",
  	path: '/login/callback',
    entryPoint: config.auth.entryPoint,
    cert: `-----BEGIN CERTIFICATE-----
    MIIDpDCCAoygAwIBAgIGAW6VH/yMMA0GCSqGSIb3DQEBCwUAMIGSMQswCQYDVQQGEwJVUzETMBEG
    A1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsGA1UECgwET2t0YTEU
    MBIGA1UECwwLU1NPUHJvdmlkZXIxEzARBgNVBAMMCmRldi0xMzcwNTkxHDAaBgkqhkiG9w0BCQEW
    DWluZm9Ab2t0YS5jb20wHhcNMTkxMTIyMjE1NzUxWhcNMjkxMTIyMjE1ODUxWjCBkjELMAkGA1UE
    BhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFjAUBgNVBAcMDVNhbiBGcmFuY2lzY28xDTALBgNV
    BAoMBE9rdGExFDASBgNVBAsMC1NTT1Byb3ZpZGVyMRMwEQYDVQQDDApkZXYtMTM3MDU5MRwwGgYJ
    KoZIhvcNAQkBFg1pbmZvQG9rdGEuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
    nMiGVI8Dn11q0JxScCv29jBqUl3PIEDExmYcqHLcRDNWHOFKU7FNr6HshC0ekXPX/56YvC1kUvVz
    WScDPQrKt1mgCkVqvmcJPOgfTrW77h7rVMamPIadQa/1ty+dC9o/TiNL9iTO/kcYWdGEGNmhR1GP
    NsFrLz+h3T8nek1cy+LZBAczN3O8KzG4aAeRTJ5+V3ajje/TgpuPHzdmbYOD5dBjP5GWWSrKYsEp
    VnWTOYfZC2HaGItFWOKp3YbgpSE3s4AmLkSo0zsEQGwHpCx+OCSJHqqhsoT7neo6RmZKWTpitOLP
    iqZYcF7Z19GbhnyWQ3nibllAhsp4uZedKbGiUQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAfxlK8
    JOGx8QV7XAKu8dVGxf6nZYmbQiEO42fkbBuJu0h+J8+NymFuuz3nwklFK2uL/ik/wa2M3kuTghGI
    onjYg9WUN/+mTJ71Os61oNjbW6dBHpTV7e0sePyepoXe00wGk5rK9TfNCWZDPZVBdPOF8rMikhyz
    pUsa+jPOROiDc3pbiip0AnD3Rln0/9l4WFjosbS0ijz54Z9Ss64voINT//el9QeMlUtEtv6IIevP
    TYY0loshOzWR92NU4p69xp3RCqIHTHngStQSjTqVKXsPVEJResNtpe/9R7OXkx8YN7FWz9wjRWyZ
    pJddGdlC2WNf0qUjRn2pFUkcJhgsb2xq
    -----END CERTIFICATE-----`
  },
  function(profile, done) {
    if (!profile.email) {
      return done(new Error("No email found"), null);
    }
    process.nextTick(function () {
      findByEmail(profile.email, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          users.push(profile);
          return done(null, profile);
        }
        return done(null, user);
      })
    });
  }
));

passport.protected = function protected(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

 exports = module.exports = passport;
