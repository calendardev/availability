import ky from 'ky';

export const getAvailability = async () => {
  return ky.get('/calendar/events').json();
}