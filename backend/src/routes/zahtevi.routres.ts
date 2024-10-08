import express from 'express';
import { ZahteviController } from '../controllers/zahtevi.controller';

const zahteviRouter = express.Router();

zahteviRouter.route('/addZahtev').post(
    (req, res) => new ZahteviController().addZahtev(req, res)
)

zahteviRouter.route('/getZU').post(
    (req, res) => new ZahteviController().GetZahteviForUser(req, res)
)

zahteviRouter.route('/getRen').post(
    (req, res) => new ZahteviController().getAllRenovatable(req, res)
)

zahteviRouter.route('/RO').post(
    (req, res) => new ZahteviController().requestOdrzavanje(req, res)
)

zahteviRouter.route('/DZ').post(
    (req, res) => new ZahteviController().deleteRequest(req, res)
)

zahteviRouter.route('/GetZahteviForCompany').post(
    (req, res) => new ZahteviController().getTasksForCompany(req, res)
)

zahteviRouter.route('/acceptTask').post(
    (req, res) => new ZahteviController().acceptTask(req, res)
)

zahteviRouter.route('/rejectTask').post(
    (req, res) => new ZahteviController().rejectTask(req, res)
)

zahteviRouter.route('/finishTask').post(
    (req, res) => new ZahteviController().finishTask(req, res)
)

zahteviRouter.route('/getM').post(
    (req, res) => new ZahteviController().getMaintables(req, res)
)

zahteviRouter.route('/rejectM').post(
    (req, res) => new ZahteviController().rejectOdrzavanje(req, res)
)

zahteviRouter.route('/acceptM').post(
    (req, res) => new ZahteviController().acceptOdrzavanje(req, res)
)

zahteviRouter.route('/getAll').post(
    (req, res) => new ZahteviController().getAll(req, res)
)

zahteviRouter.route('/getDone').post(
    (req, res) => new ZahteviController().getFinishedRequestsCount(req, res)
)

zahteviRouter.route('/getDays').post(
    (req, res) => new ZahteviController().getFinishedRequestsStats(req, res)
)


export default zahteviRouter;