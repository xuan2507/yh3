const compression = require('compression');

// Enable gzip compression for all responses
const compress = compression({
    level: 6, // balanced compression/speed
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
});

// Cache headers for static assets
const cacheHeaders = (req, res, next) => {
    // Cache static assets for 1 year (immutable)
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    next();
};

// HTTPS redirect middleware
const httpsRedirect = (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && 
        req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, 'https://' + req.headers.host + req.url);
    }
    next();
};

// Remove server fingerprinting
const removeFingerprint = (req, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
};

module.exports = { compress, cacheHeaders, httpsRedirect, removeFingerprint };
