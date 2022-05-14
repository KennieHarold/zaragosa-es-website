import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import config from 'configs';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const {username, password} = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
      });
    }

    if (username === 'admin' && password === 'admin') {
      const payload = {
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
