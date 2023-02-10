import express from "express";
import dayjs from "dayjs";
import debug from "debug";
import path from "path";
import dotenv from "dotenv";
import utils from "./utils.js";
import bodyParser from 'body-parser';

const currentDirectory = path.resolve(path.dirname('')); 

dotenv.config()

const app = express()
const port = 3002

app.use(bodyParser.json());
app.use(express.static('./dist'));
app.set('view engine', 'ejs');

const http = utils(process.env.UPDOCK_API_TOKEN);
const calendarUser = process.env.UPDOCK_USER;

app.get('/', function (req, res) {
  res.sendFile(path.join(currentDirectory, 'index.html'));
});

app.get('/hello', async (req, res) => {
  const helloResp = await http.get('hello');
  res.json(helloResp.body)
});

app.get('/calendars/list', async (req, res) => {
  try {
    const calendarListResp = await http.get('events/calendars?type=google_calendar',
      null, {
      headers: {
        'calendar-user': calendarUser
      }
    });
    res.json(calendarListResp.body)
  } catch(err) {
    res.status(err.response.body.status).json(err.response.body)
  }
});

app.get('/calendar/events/:year/:month', async (req, res) => {
  const startOfMonth = dayjs().year(req.params.year)
    .month(parseInt(req.params.month)-1)
    .startOf('month')
    .toISOString();
  const endOfMonth = dayjs().year(req.params.year)
    .month(parseInt(req.params.month)-1)
    .endOf('month')
    .toISOString();
  try {
    const {body: eventResponse} = await http.get(
      `events/calendars/events?type=google_calendar&timeMin=${startOfMonth}&timeMax=${endOfMonth}&viewBy=freeBusy&orderBy=startTime&tz=America%2FNew_York&interval=30`,
        null, {
        headers: {
          'calendar-user': calendarUser
        }
      }
    )
    res.json(eventResponse);
  } catch(err) {
    res.status(err.response.body.status).json(err.response.body)
  }
});

app.post('/calendar/events', async (req, res) => {
  try {
    const {date, name, email, details, timezone} = req.body;
    const {body: createResponse} = await http.post(
      `events/calendars/events?type=google_calendar`,
      {
        title: `${name} and UpDock`,
        description: details,
        start: {
          dateTime: date,
          timezone,
        },
        end: {
          dateTime: dayjs(date).add(30, 'm').format(),
          timezone,
        },
        attendees: [{
            email,
        }],
      },
      {
        headers: {
          'calendar-user': calendarUser,
        }
      }
    );

    return res.json(createResponse);
  } catch(err) {
    debug(err);
    return res.status(500).json({msg: "err"})
  }
});

function notFoundHandler(req, res, next) {
  return res.status(404).json({ msg: "not found" });
}

function errorHandler(err, req, res, next) {
  debug(err);
  res.status(500).json({ msg: "error", err: err.message });
}

async function init() {
  app.listen(port, () => {
    debug(`Example app listening on port ${port}`);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

export {init};