import {
  OK, NOT_FOUND, LAST_MODIFIED, NOT_MODIFIED, BAD_REQUEST, ETAG,
  CONFLICT, METHOD_NOT_ALLOWED, NO_CONTENT, CREATED, setIssueRes
} from './utils';
import Router from 'koa-router';
import {getLogger} from './utils';

const log = getLogger('student');

let studentsLastUpdateMillis = null;

export class StudentRouter extends Router {
  constructor(props) {
    super(props);
    this.studentStore = props.studentStore;
    this.io = props.io;
    this.get('/', async(ctx) => {
      let res = ctx.response;
      let lastModified = ctx.request.get(LAST_MODIFIED);
      if (lastModified && billsLastUpdateMillis && billsLastUpdateMillis <= new Date(lastModified).getTime()) {
        log('search / - 304 Not Modified (the client can use the cached data)');
        res.status = NOT_MODIFIED;
      } else {
        res.body = await this.studentStore.find({});
        if (!studentsLastUpdateMillis) {
          studentsLastUpdateMillis = Date.now();
        }
        res.set({[LAST_MODIFIED]: new Date(studentsLastUpdateMillis)});
        log('search / - 200 Ok');
      }
    }).get('/:id', async(ctx) => {
      let student = await this.studentStore.findOne({_id: ctx.params.id});
      let res = ctx.response;
      if (student) {
        log('read /:id - 200 Ok');
        this.setStudentRes(res, OK, student); //200 Ok
      } else {
        log('read /:id - 404 Not Found (if you know the resource was deleted, then you can return 410 Gone)');
        setIssueRes(res, NOT_FOUND, [{warning: 'Student not found'}]);
      }
    }).post('/', async(ctx) => {
      let student = ctx.request.body;
      let res = ctx.response;
      if (student.text ) { //validation
        await this.createStudent(res, student);
      } else {
        log(`create / - 400 Bad Request`);
        setIssueRes(res, BAD_REQUEST, [{error: 'Text is missing'}]);
      }
    }).put('/:id', async(ctx) => {
      let student = ctx.request.body;
      let id = ctx.params.id;
      let studentId = student._id;
      let res = ctx.response;
      if (studentId && studentId != id) {
        log(`update /:id - 400 Bad Request (param id and body _id should be the same)`);
        setIssueRes(res, BAD_REQUEST, [{error: 'Param id and body _id should be the same'}]);
        return;
      }
      if (!student.text) {
        log(`update /:id - 400 Bad Request (validation errors)`);
        setIssueRes(res, BAD_REQUEST, [{error: 'Text is missing'}]);
        return;
      }
      if (!studentId) {
        await this.createStudent(res, student);
      } else {
        let persistedStudent = await this.studentStore.findOne({_id: id});
        if (persistedStudent) {
          let studentVersion = parseInt(ctx.request.get(ETAG)) || student.version;
          if (!studentVersion) {
            log(`update /:id - 400 Bad Request (no version specified)`);
            setIssueRes(res, BAD_REQUEST, [{error: 'No version specified'}]); //400 Bad Request
          } else if (studentVersion < persistedStudent.version) {
            log(`update /:id - 409 Conflict`);
            setIssueRes(res, CONFLICT, [{error: 'Version conflict'}]); //409 Conflict
          } else {
            student.version = studentVersion + 1;
            student.updated = Date.now();
            let updatedCount = await this.studentStore.update({_id: id}, student);
            studentsLastUpdateMillis = student.updated;
            if (updatedCount == 1) {
              this.setStudentRes(res, OK, student); //200 Ok
              this.io.emit('student-updated', student);
            } else {
              log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
              setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Student no longer exists'}]); //
            }
          }
        } else {
          log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
          setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Student no longer exists'}]); //Method Not Allowed
        }
      }
    }).del('/:id', async(ctx) => {
      let id = ctx.params.id;
      await this.studentStore.remove({_id: id});
      this.io.emit('student-deleted', {_id: id})
      studentsLastUpdateMillis = Date.now();
      ctx.response.status = NO_CONTENT;
      log(`remove /:id - 200 Ok , or 204 No content (even if the resource was already deleted)`);
    });
  }
  

  async createStudent(res, student) {
    student.version = 1;
    student.updated = Date.now();
    let insertedStudent = await this.studentStore.insert(student);
    studentsLastUpdateMillis = student.updated;
    this.setStudentRes(res, CREATED, insertedStudent); //201 Created
    this.io.emit('student-created', insertedStudent);
  }

  setStudentRes(res, status, student) {
    res.body = student;
    res.set({
      [ETAG]: student.version,
      [LAST_MODIFIED]: new Date(student.updated)
    });
    res.status = status; //200 Ok or 201 Created
  }
}
