import * as express from 'express';
import User from '../models/user'
import bcrypt from 'bcrypt';

import Company from '../models/company';

export class UserController {
    login = async(req: express.Request, res: express.Response) => {
        const username = req.body.username;
        const password = req.body.password;
        const type = req.body.type;

        let roleCondition: any;

        if (type === "admin") {
            roleCondition = "admin";
        } else if (type === "") {
            roleCondition = { $in: ["vlasnik", "dizajner"] };
        } else {
            roleCondition = type;
        }

        try {
            const user = await User.findOne({ 'username': username, 'role': roleCondition, 'approved': true });
            if (user && user.password) {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    res.json(user);
                } else {
                    res.status(401).json({ message: "Pogresan password" });
                }
            } else {
                res.status(404).json({ message: "Korisnik nije nadjen" });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    getAll = (req: express.Request, res: express.Response) => {
        User.find({}).then(users => {
            res.json(users);
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal server error" });
        });
    }

    updateUser = async (req: express.Request, res: express.Response) => {
        const { originalUsername, updatedData } = req.body;
    
        try {
            const user = await User.findOne({ username: originalUsername });
    
            if (user) {
                Object.assign(user, updatedData);
                const updatedUser = await user.save();
    
                if (updatedData.username && updatedData.username !== originalUsername) {
                    await Company.updateMany(
                        { decorators: originalUsername },
                        { $set: { "decorators.$": updatedData.username } }
                    );
                }
    
                res.json(updatedUser);
            } else {
                res.status(404).json({ message: "Korisnik nije nadjen" });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    getUserByUsername = async (req: express.Request, res: express.Response) => {
        const { username } = req.body;
        
        try {
          const user = await User.findOne({ username });
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

    addUser = async (req: express.Request, res: express.Response) => {
        const { user } = req.body;
    
        if (!user) {
            return res.status(400).json({ message: "Los zahtev." });
        }
    
        const { username, email, password } = user;
        console.log(username);
        console.log(email);
        console.log(password);
    
        try {
            if (!password) {
                return res.status(400).json({ message: "Nema passworda." });
            }
    
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: "Korisnicko ime vec postoji." });
            }
    
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: "Email vec postoji." });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
    
            const newUser = new User({
                ...user,
                password: hashedPassword
            });
    
            await newUser.save();
    
            const { password: _, ...userWithoutPassword } = newUser.toObject();
            res.status(201).json(userWithoutPassword);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    resetPassword = async (req: express.Request, res: express.Response) => {
        const { username, password, newPassword } = req.body;

        try {
            const user = await User.findOne({ username });

            if (!user) {
                return res.status(404).json({ message: "Korisnik nije nadjen" });
            }

            const match = await bcrypt.compare(password, user.password!);
            if (!match) {
                return res.status(401).json({ message: "Pogresan password" });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
            await user.save();

            res.status(200).json({ message: "Uspeh" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    getDecoratorCount = async (req: express.Request, res: express.Response) => {
        try {
          const decoratorCount = await User.countDocuments({ role: 'dizajner' });
          res.status(200).json({ count: decoratorCount });
        } catch (error) {
          res.status(500).json({ message: 'Greskat.' });
        }
    }

    getOwnerCount = async (req: express.Request, res: express.Response) => {
        try {
          const ownerCount = await User.countDocuments({ role: 'vlasnik' });
          res.status(200).json({ count: ownerCount });
        } catch (error) {
          res.status(500).json({ message: 'Greska.' });
        }
    }
}
