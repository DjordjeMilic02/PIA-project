import { Request, Response } from 'express';
import Company from '../models/company';
import User from '../models/user';

export class CompanyController {
    addCompany = async (req: Request, res: Response) => {
        const companyData = req.body.company;
    
        try {
            console.log(companyData.decorators);
            if (!Array.isArray(companyData.decorators) || companyData.decorators.length === 0) {
                return res.status(400).json({ message: "Morate navesti dekoratore." });
            }
    
            if (Array.isArray(companyData.prices)) {
                companyData.prices = companyData.prices.map((price: string | number) => parseFloat(price as string));
            } else {
                return res.status(400).json({ message: "Cene su lose." });
            }
    
            const uniqueDecorators = new Set(companyData.decorators);
            if (uniqueDecorators.size !== companyData.decorators.length) {
                return res.status(400).json({ message: "Isti dekorator ne sme biti naveden 2 puta." });
            }
    
            const decorators = await User.find({
                username: { $in: companyData.decorators },
                role: 'dizajner',
                rejected: false,
                company: { $exists: false }
            });
    
            if (decorators.length !== companyData.decorators.length) {
                return res.status(400).json({ message: "Greska sa dizajnerima." });
            }
    
            const decoratorNames = decorators.map(decorator => decorator.name);
            const nameSet = new Set(decoratorNames);
            if (nameSet.size !== decoratorNames.length) {
                return res.status(400).json({ message: "Greska sa dekoratorima." });
            }
    
            const newCompany = new Company(companyData);
            await newCompany.save();
    
            await User.updateMany(
                { username: { $in: companyData.decorators } },
                { $set: { company: newCompany._id } }
            );
    
            res.status(201).json(newCompany);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    getAllCompanies = async (req: Request, res: Response) => {
        try {
            const companies = await Company.find();
            res.status(200).json(companies);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    
    
}