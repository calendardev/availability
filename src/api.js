import ky from "ky";

export const getAvailability = async ({ year, month }) => {
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
