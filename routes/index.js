import express from 'express';

const router = express.Router();

// miidleware sets set content type for all routes
router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

/* Hand get requests for '/'
/* this is the index or home page
*/
router.get('/', async (req, res) => {

    try {
        const authSuccess = req.query.auth === 'success';
        const message = authSuccess
            ? 'Authentication successful! You can now use the API endpoints.'
            : 'Fitbit API Server is running. Go to /auth/login to authenticate with Fitbit.';


        res.json({ authSuccess: message });
    } catch (e) {
        res.status(500).send(e.toString());
    }

});

export default router;