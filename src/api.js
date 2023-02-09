import ky from "ky";

export const getAvailability = async ({ year, month }) => {
  return ky.get(`/calendar/events/${year}/${month+1}`).json();
};
