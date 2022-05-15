import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import config from 'configs';
import {JwtPayload} from 'types/auth';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const {username, password} = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
      });
    }

    if (username === 'admin' && password === 'admin') {
      const payload: JwtPayload = {
        user: {
          id: 'admin',
        },
      };

      jwt.sign(payload, config['jwtSecret'], {expiresIn: 3600}, (err, token) => {
        if (err) throw err;
        return res.status(200).json({token, message: 'Login success'});
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: 'Server error'});
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const {username, password} = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
      });
    }

    if (username === 'admin' && password === 'admin') {
      return res.status(200).json({message: 'User added'});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: 'Server error'});
  }
};
