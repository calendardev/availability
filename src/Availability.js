import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {getAvailability} from './api.js';

export default function Availability() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.guess();

  const queryClient = useQueryClient();
  const d = dayjs();

  const monthInt = d.month() + 1;

  const availabilityQuery = useQuery({ queryKey: ['availability', d.month], queryFn: getAvailability });

  function displayDate() {
    return d.format('MMMM YYYY');
  }
  
  function displayTime() {
    return d.format('h:mm a');
  }
  
  function startDate() {
    return d.startOf("month");
  }

  function endDate() {
    return d.endOf("month"); 
  }

  function firstDayOfMonth() {
    return parseInt(startDate().format('d'))
  }

  function lastDateOfMonth() {
    return parseInt(endDate().format('D'))
  }

  function availableOnDate(date) {
    if(availabilityQuery.isSuccess) {
      return availabilityQuery.data?.data?.freeDates[d.year()][d.month()+1][date]
    }
  }

  function DaysOfTheWeek() {
    const days = "smtwtfs".toUpperCase().split("");
    const listItems = days.map((day, i) =>
      <div key={i}>{day}</div>
    );
    return (
      <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
        <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
          {listItems}
        </div>
      </div>
    );
  }

  function CalendarDateButton({invisible, firstDay, day, index}) {
    const displayDate = `${(index + 1) - firstDay}`;
    const available = availableOnDate(displayDate);
    return (
      <button key={day.toString()} disabled={available ? "disabled" : null} type="button" className={`py-2 m-1 bg-blue-100 hover:bg-blue-200 font-semibold rounded-full text-blue-700 hover:text-blue-800 disabled:text-gray-200 disabled:bg-transparent focus:z-10 ${invisible}`}>
        <time dateTime="2021-12-27" className="mx-auto flex h-7 w-7 items-center justify-center rounded-full">{displayDate}</time>
      </button>
    )
  }

  function CalendarDates() {
    const firstDay = firstDayOfMonth();
    const lastDate = lastDateOfMonth();
    const cells = [...Array(42).keys()];
    const listItems = cells.map((day, i) => {
      const invisible = (i >= firstDay && ((i + 1) - firstDay) <= lastDate) ? "" : "invisible";
      return (
        <CalendarDateButton invisible={invisible} firstDay={firstDay} day={day} index={i} />
      )
    });
    return (
      <div className={`ease-in duration-300 transition-all isolate mt-2 grid grid-cols-7 gap-px rounded-lg text-sm ${availabilityQuery.isLoading ? "scale-0" : "scale-100"}`}>
        {listItems}
      </div>
    )
  }
  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <svg className="mx-auto h-12 w-auto" viewBox="0 0 234 234">
            <g>
              <path fill="none" stroke="#c84a67" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" d="M 52.625 8 L 52.625 35.375 M 180.375 8 L 180.375 35.375 M 7 199.625 L 7 62.75 C 7 47.631195 19.256207 35.375 34.375 35.375 L 198.625 35.375 C 213.743805 35.375 226 47.631195 226 62.75 L 226 199.625 M 7 199.625 C 7 214.743805 19.256207 227 34.375 227 L 198.625 227 C 213.743805 227 226 214.743805 226 199.625 M 7 199.625 L 7 108.375 C 7 93.25621 19.256207 81 34.375 81 L 198.625 81 C 213.743805 81 226 93.25621 226 108.375 L 226 199.625"/>
              <path fill="none" stroke="#c84a67" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" d="M 108.513687 117.389214 L 108.513687 138.694244 C 108.513702 140.91922 107.629852 143.05307 106.056557 144.626389 L 90.803001 159.879944 M 108.513687 117.389214 C 107.577812 117.474976 106.645676 117.575638 105.717262 117.694962 M 108.513687 117.389214 C 114.094498 116.870262 119.711418 116.870262 125.292229 117.389214 M 125.292229 117.389214 L 125.292229 138.694244 C 125.292229 140.920197 126.175903 143.056671 127.749359 144.626389 L 145.985764 162.862793 M 125.292229 117.389214 C 126.228104 117.474976 127.160248 117.575638 128.088654 117.694962 M 145.985764 162.862793 L 140.131927 164.328125 C 132.328033 166.256531 124.092316 165.340439 116.902962 161.744232 C 109.7136 158.148041 101.47789 157.231918 93.673996 159.160339 L 90.803001 159.879944 M 145.985764 162.862793 L 151.213226 168.09024 C 155.806808 172.683838 153.63678 180.461639 147.234848 181.554108 C 137.2146 183.262268 127.067749 184.119171 116.902962 184.115631 C 106.563644 184.115631 96.429405 183.23941 86.571075 181.554108 C 80.165398 180.461639 77.995377 172.683838 82.592697 168.093979 L 90.803001 159.879944"/>
            </g>
          </svg>  
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">Talk with UpDock</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Check our availability and get on our calendar
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div>
              <p>{displayDate()}</p>
              <DaysOfTheWeek />
              <CalendarDates />
              <p className="mt-10 font-semibold">Timezone</p>
              <p>{dayjs.tz.guess()} ({displayTime()})</p>
            </div>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or check us out on</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <a
                    href="https://twitter.com/UpDockCal"
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                  >
                    <span className="sr-only">@UpDockCal on Twitter</span>
                    <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
                <div>
                  <a
                    href="https://github.com/updock"
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign in with GitHub</span>
                    <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}