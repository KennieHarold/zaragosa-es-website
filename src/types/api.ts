import {Request} from 'express';

export interface IUser {
  id: string;
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

export interface IForm {
  id: string;
  studentId: string;
  schoolYear: string;
  quarter: string;
  eng: number;
  math: number;
  fil: number;
  sci: number;
  ap: number;
  epp: number;
  mapeh: number;
  esp: number;
}

export interface ICalendar {
  id: string;
  event: string;
  date: string;
}

export interface CustomRequest<T> extends Request {
  body: T;
}
