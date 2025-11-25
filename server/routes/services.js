const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const serviceController = require('../controllers/serviceController');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.get('/category/:id', serviceController.getServicesByCategory); 
router.post('/', auth, serviceController.createService);
router.put('/:id', auth, serviceController.updateService);
router.delete('/:id', auth, serviceController.deleteService);

module.exports = router;