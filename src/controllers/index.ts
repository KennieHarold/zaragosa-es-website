import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import JSONdb from 'simple-json-db';
import {v4 as uuidv4} from 'uuid';

import config from 'configs';

import {JwtPayload} from 'types/auth';
import {CustomRequest, IUser, IForm, ICalendar} from 'types/api';

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

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const Students = new JSONdb('db/Students.json');
    const StudentsJSON = Students.JSON();
    const id = req.params.studentId;

    return res.status(200).json({id, ...StudentsJSON[id]});
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const Students = new JSONdb('db/Students.json');
    const id = req.params.studentId;

    Students.set(id, {...req.body});

    return res.status(200).json({message: 'Success'});
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};

export const searchStudent = async (req: Request, res: Response) => {
  try {
    const search = req?.query?.search as string;
    const Students = new JSONdb('db/Students.json');
    const StudentsJSON = Students.JSON();

    const students = [];

    if (search) {
      if (search.length >= 3) {
        Object.keys(StudentsJSON).forEach((key) => {
          const upperStudentFirstName = StudentsJSON[key].firstname.toUpperCase();
          const upperStudentLastName = StudentsJSON[key].lastname.toUpperCase();
          const upperSearch = search.toUpperCase();

          if (upperStudentFirstName.includes(upperSearch) || upperStudentLastName.includes(upperSearch)) {
            students.push({
              id: key,
              ...StudentsJSON[key],
            });
          }
        });
      }
    }

    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};

export const getFormsByStudentIdAndSY = async (req: Request, res: Response) => {
  try {
    const studentId = req?.query?.studentId;
    const sy = req?.query?.sy;

    const Forms = new JSONdb('db/Forms.json');
    const FormsJSON = Forms.JSON();

    const forms = [];

    Object.keys(FormsJSON).forEach((key) => {
      if (FormsJSON[key].studentId === studentId && FormsJSON[key].schoolYear === sy) {
        forms.push({
          id: key,
          ...FormsJSON[key],
        });
      }
    });
    return res.status(200).json(forms);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};

export const addForm = async (req: CustomRequest<IForm>, res: Response) => {
  try {
    const studentId = req?.body?.studentId;
    const quarter = req?.body?.quarter;
    const schoolYear = req?.body?.schoolYear;

    const Forms = new JSONdb('db/Forms.json');
    const FormsJSON = Forms.JSON();

    const form = [];

    // Check if student already has a form with the same quarter and school year
    Object.keys(FormsJSON).forEach((key) => {
      if (
        FormsJSON[key].studentId === studentId &&
        FormsJSON[key].quarter === quarter &&
        FormsJSON[key].schoolYear === schoolYear
      ) {
        form.push({
          id: key,
          ...FormsJSON[key],
        });
      }
    });

    if (form.length > 0) {
      Forms.set(form[0].id, {...req.body});
    } else {
      const id = uuidv4();
      Forms.set(id, {...req.body});
    }

    return res.status(200).json({message: 'Success'});
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};

export const addEvent = async (req: CustomRequest<ICalendar>, res: Response) => {
  try {
    if (!req.body.event || !req.body.date) {
      return res.status(400).json({
        message: 'Missing params!',
      });
    }

    const Calendar = new JSONdb('db/Calendar.json');
    const CalendarJSON = Calendar.JSON();

    let isExist = false;

    Object.keys(CalendarJSON).forEach((key) => {
      if (CalendarJSON[key].date === req.body.date) {
        Calendar.set(key, {...req.body});
        isExist = true;
      }
    });

    if (!isExist) {
      const id = uuidv4();
      Calendar.set(id, {...req.body});
    }

    return res.status(200).json({message: 'Success'});
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};

export const getCalendarEventsThisMonth = async (req: Request, res: Response) => {
  try {
    const Calendar = new JSONdb('db/Calendar.json');
    const CalendarJSON = Calendar.JSON();
    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();
    const events = [];

    Object.keys(CalendarJSON).forEach((key) => {
      const eventDate = new Date(CalendarJSON[key].date);
      if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
        events.push({
          id: key,
          ...CalendarJSON[key],
        });
      }
    });

    return res.status(200).json(events);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
};
