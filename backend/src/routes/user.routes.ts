import express from 'express';
import { UserController } from '../controllers/user.controller';
const userRouter = express.Router();

userRouter.route('/login').post(
    (req, res) => new UserController().login(req, res)
)

userRouter.route('/getAll').post(
    (req, res) => new UserController().getAll(req, res)
)

userRouter.route('/updateUser').post(
    (req, res) => new UserController().updateUser(req, res)
)

userRouter.route('/addUser').post(
    (req, res) => new UserController().addUser(req, res)
)

userRouter.route('/resetPassword').post(
    (req, res) => new UserController().resetPassword(req, res)
)

userRouter.route('/getByUsername').post(
    (req, res) => new UserController().getUserByUsername(req, res)
)

userRouter.route('/getDC').post(
    (req, res) => new UserController().getDecoratorCount(req, res)
)

userRouter.route('/getOC').post(
    (req, res) => new UserController().getOwnerCount(req, res)
)


export default userRouter;