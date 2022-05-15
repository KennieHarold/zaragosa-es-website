import {Request} from 'express';

export interface IUser {
  studentId: string;
  firstname: string;
  middleInitial: string;
  lastname: string;
  age: string;
  bday: string;
  gender: 'male' | 'female';
  requirements: string[];
  schoolYear: string;
  grade: string;
  section: string;
}

export interface CustomRequest<T> extends Request {
  body: T;
}
