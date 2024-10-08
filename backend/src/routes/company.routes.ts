import express from 'express';
import { CompanyController } from '../controllers/company.controller';

const companyRouter = express.Router();
const companyController = new CompanyController();

companyRouter.route('/addCompany').post(
    (req, res) => new CompanyController().addCompany(req, res)
)

companyRouter.route('/getCompanies').post(
    (req, res) => new CompanyController().getAllCompanies(req, res)
)

export default companyRouter;