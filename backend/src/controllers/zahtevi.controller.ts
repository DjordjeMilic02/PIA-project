import express from 'express';
import Zahtevi from '../models/zahtev';
import Company from '../models/company';
import User from '../models/user'

export class ZahteviController {
  
  addZahtev = async (req: express.Request, res: express.Response) => {
    const {_id, dateTime, Area, Type, extra, company, designated, services, raspored, callerUsername, dateFinished, dateActive, waterSurfaceCount, finished, rejected, rejectionText, odrzavanjeRequested} = req.body.zahtev;

    try {
      const newZahtev = new Zahtevi({
        dateTime,
        Area,
        Type,
        extra,
        company,
        designated,
        services,
        raspored,
        callerUsername,
        dateFinished, 
        dateActive,
        waterSurfaceCount, 
        finished,
        rejected,
        rejectionText,
        odrzavanjeRequested
      });

      await newZahtev.save();

      res.status(201).json(newZahtev);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  GetZahteviForUser = async (req: express.Request, res: express.Response) => {
    const username = req.body.user;

    try {
      const user = await Zahtevi.find({ callerUsername : username, finished: 'false' });
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'Korisnik nije nadjen' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
}

  getAllRenovatable = async (req: express.Request, res: express.Response) => {
    const username = req.body.user;

    try {
      const renovatableZahtevi = await Zahtevi.find({
        callerUsername: username,
        finished: 'true'
      });

      if (renovatableZahtevi.length > 0) {
        res.json(renovatableZahtevi);
      } else {
        res.status(404).json({ message: 'Nema zahteva' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  requestOdrzavanje = async (req: express.Request, res: express.Response) => {
    const { _id } = req.body;

    try {
      const updatedZahtev = await Zahtevi.findByIdAndUpdate(
        _id,
        { odrzavanjeRequested: true },
        { new: true }
      );

      if (updatedZahtev) {
        res.status(200).json(updatedZahtev);
      } else {
        res.status(404).json({ message: 'Zahtev nije nadjen' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  deleteRequest = async (req: express.Request, res: express.Response) => {
    const { _id } = req.body;

    try {
      if (!_id) {
          return res.status(400).json({ message: 'Los zahtev.' });
      }

      const zahtev = await Zahtevi.findById(_id);

      if (!zahtev) {
          return res.status(404).json({ message: 'Zahtev nije nadjen.' });
      }

      await Zahtevi.findByIdAndDelete(_id);

      return res.status(200).json({ message: 'Zahtev obrisan.' });
  } catch (error) {
      return res.status(500).json({ message: 'Greska.' });
  }
    
  }

  getTasksForCompany = async (req: express.Request, res: express.Response) => {
    const username = req.body.user;

    try {
      const company = await Company.findOne({ decorators: username });
      if (!company) {
        return res.status(404).json({ message: 'Kompanija nije nadjena.' });
      }

      const tasks = await Zahtevi.find({
        company: company.name,
        finished: false,
        rejected: false,
        $or: [{ designated: null }, { designated: username }]
      });

      res.status(200).json(tasks);
    } catch (error) {
      console.error('Greska:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  acceptTask = async (req: express.Request, res: express.Response) => {
    const { _id, user } = req.body;

    try {
      const updatedZahtev = await Zahtevi.findByIdAndUpdate(
        _id,
        { designated: user },
        { new: true }
      );

      if (updatedZahtev) {
        res.status(200).json(updatedZahtev);
      } else {
        res.status(404).json({ message: 'Zahtev nije nadjen' });
      }
    } catch (error) {
      console.error('Greska:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  rejectTask = async (req: express.Request, res: express.Response) => {
    const { _id, rejectionText } = req.body;

    try {
      const updatedZahtev = await Zahtevi.findByIdAndUpdate(
        _id,
        { rejected: true, rejectionText },
        { new: true }
      );

      if (updatedZahtev) {
        res.status(200).json(updatedZahtev);
      } else {
        res.status(404).json({ message: 'Zahtev nije nadjen' });
      }
    } catch (error) {
      console.error('Greske', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  finishTask = async (req: express.Request, res: express.Response) => {
    const { _id } = req.body;

    try {
      const updatedZahtev = await Zahtevi.findByIdAndUpdate(
        _id,
        { finished: true, dateActive: new Date() },
        { new: true }
      );

      if (updatedZahtev) {
        res.status(200).json(updatedZahtev);
      } else {
        res.status(404).json({ message: 'Zahtev nije nadjen' });
      }
    } catch (error) {
      console.error('Greska:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  getMaintables = async (req: express.Request, res: express.Response) => {
    const { user } = req.body;

    try {
        const company = await Company.findOne({ decorators: user });

        if (!company) {
            return res.status(404).json({ message: 'Kompanija nije nadjena.' });
        }

        const zahtevi = await Zahtevi.find({
            odrzavanjeRequested: true,
            company: company.name
        });

        res.status(200).json(zahtevi);
    } catch (error) {
        console.error('Greska:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

  rejectOdrzavanje = async (req: express.Request, res: express.Response) => {
    const { _id } = req.body;

    try {
        const zahtev = await Zahtevi.findById(_id);

        if (!zahtev) {
            return res.status(404).json({ message: 'Zahtev nije nadjen.' });
        }

        zahtev.odrzavanjeRequested = false;
        await zahtev.save();

        res.status(200).json({ message: 'Uspeh.' });
    } catch (error) {
        console.error('Greska:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
  }

  acceptOdrzavanje = async (req: express.Request, res: express.Response) => {
    const { _id, dateActive } = req.body;

    try {
        const zahtev = await Zahtevi.findById(_id);

        if (!zahtev) {
            return res.status(404).json({ message: 'Zahtev nije nadjen.' });
        }

        zahtev.odrzavanjeRequested = false;
        zahtev.dateActive = new Date(dateActive);
        await zahtev.save();

        res.status(200).json({ message: 'Uspeh.' });
    } catch (error) {
        console.error('Greska:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
  }

  getAll = async (req: express.Request, res: express.Response) => {
    try {
        const { user } = req.body;

        const company = await Company.findOne({ decorators: user });

        if (!company) {
            return res.status(404).json({ message: 'Kompanija nije nadjena.' });
        }

        const zahtevi = await Zahtevi.find({ company: company.name, finished: true });

        res.status(200).json(zahtevi);
    } catch (error) {
        console.error('Greska:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
  }

  getFinishedRequestsCount = async (req: express.Request, res: express.Response) => {
    try {
      const count = await Zahtevi.countDocuments({ finished: true });
  
      res.status(200).json({ count });
    } catch (error) {
      console.error('Greska:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }

  getFinishedRequestsStats = async (req: express.Request, res: express.Response) => {
    try {
      const now = new Date();
      
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const countLast24Hours = await Zahtevi.countDocuments({
        finished: true,
        dateFinished: { $gte: last24Hours }
      });

      const countLast7Days = await Zahtevi.countDocuments({
        finished: true,
        dateFinished: { $gte: last7Days }
      });

      const countLast30Days = await Zahtevi.countDocuments({
        finished: true,
        dateFinished: { $gte: last30Days }
      });

      res.status(200).json({
        last24Hours: countLast24Hours,
        last7Days: countLast7Days,
        last30Days: countLast30Days
      });
    } catch (error) {
      console.error('Greska:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };


}

export default new ZahteviController();