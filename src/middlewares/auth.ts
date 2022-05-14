import jwt from 'jsonwebtoken';

import configs from 'configs';

import {Request, Response, NextFunction} from 'express';
import {JwtPayload} from 'types/auth';

export const rbac = (redirect: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req?.cookies['token'];
      const path = req?.path;

      if (path === '/admin' || path === '/admin/') {
        if (token) {
          const {user} = jwt.verify(token, configs['jwtSecret']) as JwtPayload;
          if (user.id === 'admin') {
            return res.redirect(redirect);
          }
        }
      } else {
        if (!token) {
          return res.redirect(redirect);
        }
      }
      return next();
    } catch (error) {
      console.log(error);
      return res.redirect(redirect);
    }
  };
};
