import ky from "ky";

export const getAvailability = async ({ year, month }) => {
  console.log("month+1", month+1)
  return ky.get(`/calendar/events/${year}/${month + 1}`).json();
};

export const createEvent = async ({ date, name, email, details, timezone }) => {
  return ky
    .post(`/calendar/events`, {
      json: {
        date,
        name,
        email,
        details,
        timezone,
      },
    })
    .json();
};
