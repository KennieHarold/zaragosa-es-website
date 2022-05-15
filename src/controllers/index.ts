import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import JSONdb from 'simple-json-db';
import {v4 as uuidv4} from 'uuid';

import config from 'configs';

import {JwtPayload} from 'types/auth';
import {CustomRequest, IUser} from 'types/api';

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

export const addStudent = async (req: CustomRequest<IUser>, res: Response) => {
  try {
    const Students = new JSONdb('db/Students.json');
    const body = req.body;

    const id = uuidv4();
    Students.set(id, {...body});

    return res.status(200).json({message: 'Success'});
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: 'Server error'});
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const Students = new JSONdb('db/Students.json');
    const StudentsJSON = Students.JSON();
    const data = [];

    Object.keys(StudentsJSON).forEach((key) => {
      data.push({
        id: key,
        ...StudentsJSON[key],
      });
    });

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({message: 'Server error'});
  }
};
