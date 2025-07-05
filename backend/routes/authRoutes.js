import express from 'express'
import { login, register } from '../controllers/auth-controller.js'

export const authRouter = express.Router()

authRouter.route('/registerNewUser').post(register)
authRouter.route('/login').post(login)
