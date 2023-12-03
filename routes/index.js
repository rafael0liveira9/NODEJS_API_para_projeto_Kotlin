const { Router, json, urlencoded } = require('express'),
    user = require('../services/user'),
    schedule = require('../services/scheduleList'),
    services = require('../services/ourServices'),
    moment = require('moment'),

    router = Router();
router.use(json());
router.use(urlencoded({ extended: true }));

router.get('/', async (_, res) => res.json({ status: process.env.TEST }));

// *********************************************************************************************** ROUTES
// *********************************************************************************************** USER ROUTES
router.post('/signin-user', async (req, res) => {
    console.log("chamou a rota")
    const data = await user.signIn(req.body);
    res.status(!!data.status ? data.status : 200).json(!!data.status ? { message: data.message, user: data.user } : data)
});

router.post('/new-user', async (req, res) => {
    const data = await user.newUser(req.body);
    res.status(!!data.status ? data.status : 200).json(data)
});

router.post('/update-user', async (req, res) => {
    const data = await user.updateUser(req.body, req.headers.authorization);
    res.status(!!data.status ? data.status : 200).json(!!data.status ? { message: data.message } : data)
});

router.post('/delete-user', async (req, res) => {
    const data = await user.deleteUser(req.headers.authorization);
    res.status(!!data.status ? data.status : 200).json(!!data.status ? { message: data.message } : data)
});

// *********************************************************************************************** EVENTS ROUTES

router.post('/get-events', async (req, res) => {
    try {
        const data = await schedule.getEvent(req.headers.authorization);
        res.status(!!data.status ? data.status : 200).json(data)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao obter a lista' });
    }
});

router.post('/get-event-by-id', async (req, res) => {
    try {
        const data = await schedule.getEvent(req.body, req.headers.authorization);
        res.status(!!data.status ? data.status : 200).json(data)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao obter a lista' });
    }
});

router.post('/create-schedule', async (req, res) => {
    const data = await schedule.newSchedule(req.body, req.headers.authorization);
    res.status(!!data.status ? data.status : 200).json(!!data.status ? { message: data.message } : data)
});

router.post('/delete-schedule', async (req, res) => {
    const data = await schedule.deleteSchedule(req.body, req.headers.authorization);
    res.status(!!data.status ? data.status : 200).json(!!data.status ? { message: data.message } : data)
});

// *********************************************************************************************** SERVICES ROUTES

router.post('/create-service', async (req, res) => {
    try {
        const data = await Promise.all(req.body.map((e) => services.newService(e)));
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro interno ao processar os serviços' });
    }
});

router.post('/delete-service', async (req, res) => {
    const data = await services.deleteService(req.body);
    res.status(!!data.status ? data.status : 200).json(!!data.status ? { message: data.message } : data)
});

// *********************************************************************************************** LIST ROUTES

router.get('/get-list', async (req, res) => {
    try {
        const data = await schedule.getList();
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao obter a lista' });
    }
});

router.post('/create-list', async (req, res) => {
    try {
        const data = await Promise.all(req.body.map((e) => schedule.newList(e)));
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro interno ao processar os agendamentos' });
    }
});

router.post('/delete-list', async (req, res) => {
    const data = await schedule.deleteList(req.body);
    res.status(!!data.status ? data.status : 200).json(!!data.status ? { message: data.message } : data)
});

module.exports = router