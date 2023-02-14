import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { InformationCircleIcon, ChevronRightIcon, ChevronLeftIcon, CalendarIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAvailability, createEvent } from "./api.js";

function Loading() {
  return (
    <>
      <div className="-mt-6 flex h-5 w-full bg-gray-200 rounded-md"></div>
      <div className="mt-4 w-vw flex h-5 w-full bg-gray-200 rounded-md"></div>
      <div className="mt-4 flex h-5 w-full bg-gray-200 rounded-md"></div>
      <div className="mt-4 flex h-5 w-full bg-gray-200 rounded-md"></div>
      <div className="mt-4 flex h-5 w-full bg-gray-200 rounded-md"></div>
      <div className="mt-4 flex h-5 w-full bg-gray-200 rounded-md"></div>
      <div className="mt-4 flex h-5 w-full bg-gray-200 rounded-md"></div>
      <div className="mt-4 flex h-5 w-full bg-gray-200 rounded-md"></div>
    </>
  );
}

function SubmitLoading() {
  return (
    <div className="submit-loading">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

function listFreeTimeGapsForInterval({
  startTime,
  endTime,
  interval,
}) {
  const gaps = [];
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const diff = end.diff(start, "m");
  const slotsAvailable = Math.floor(end.diff(start, "m") / interval);
  for (let i = 0; i < slotsAvailable; i++) {
    gaps.push({
      start: start.add(interval * i, "m").format(),
      end: start.add(interval * (i + 1), "m").format(),
    });
  }
  return gaps;
}

export default function Availability() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(customParseFormat);
  const url = new URL(window.location);

  useEffect(() => {
    history.replaceState({page: "availability", drawerIsOpen}, '', url)
    addEventListener('popstate', (event) => {
        if(event.state.page === 'availability') setConfirmedTime(null);
        setDrawerIsOpen(event.state.drawerIsOpen || false);
    })
  }, [])

  const queryClient = useQueryClient();
  const guessedTimezone = dayjs.tz.guess();
  let [d, setD] = useState(dayjs())
  let [drawerIsOpen, setDrawerIsOpen] = useState(false);
  let [confirmedTime, setConfirmedTime] = useState(null);
  let [selectedDate, setSelectedDate] = useState(d.date());
  let [freeTimesForDate, setFreeTimesForDate] = useState([]);
  let [isEventCreated, setIsEventCreated] = useState(false);
// queryClient.invalidateQueries({ queryKey: ['availability', d.month })
  const { isSuccess, data, isLoading, isError, error } = useQuery({
    retry: 1,
    queryKey: ["availability", d.month(), d.year()],
    queryFn: () => {
      return getAvailability({
        year: d.year(),
        month: d.month(),
      })
    }
  });

  const { isLoading: isLoadingForm, mutate } = useMutation({
    mutationFn: (details) =>
      createEvent({
        ...{ date: confirmedTime.format, timezone: guessedTimezone },
        ...details,
      }),
    onSuccess() {
      setIsEventCreated(true);
    },
    onError() {},
  });

  function displayDate() {
    return d.format("MMMM YYYY");
  }

  function displayTime() {
    return d.format("h:mm a");
  }

  function startDate() {
    return d.startOf("month");
  }

  function endDate() {
    return d.endOf("month");
  }

  function firstDayOfMonth() {
    return parseInt(startDate().format("d"));
  }

  function lastDateOfMonth() {
    return parseInt(endDate().format("D"));
  }

  function availableOnDate(date) {
    if (isSuccess) {
      const available =
        data?.data?.freeTimes?.[d.year()]?.[d.month() + 1]?.[date]?.available;
      if (available === undefined) {
        return true;
      }

      return available;
    }
  }

  function Unauthorized() {
    function getStatus() {
      return error.response?.status ?? "500";
    }

    function getStatusText() {
      return error.response?.statusText ?? "Service unavailable";
    }

    function getError() {
      return `${getStatus()} ${getStatusText()}`;
    }

    const errorStatusText = error?.response?.statusText;
    return (
      <div className="rounded-md bg-blue-50 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon
              className="h-5 w-5 text-blue-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm text-blue-700">{getError()}</p>
          </div>
        </div>
      </div>
    );
  }

  function DaysOfTheWeek() {
    const days = "smtwtfs".toUpperCase().split("");
    const listItems = days.map((day, i) => <div key={i}>{day}</div>);
    return (
      <>
        {isLoading ? null : isError ? null : (
          <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
            <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
              {listItems}
            </div>
          </div>
        )}
      </>
    );
  }

  function CalendarDateButton({ invisible, firstDay, day, index }) {
    const displayDate = `${index + 1 - firstDay}`;
    const available = availableOnDate(displayDate);

    function setCalendarDate(date) {
      setSelectedDate(date.toString());
      const selectedDate = d.set('date', date);
      setDrawerIsOpen(true);
      history.replaceState({page: "availability", drawerIsOpen: true}, '', url)
      let times =
        data?.data?.freeTimes?.[d.year()]?.[d.month() + 1]?.[displayDate]
          ?.times;
      if (!times) {
        times = listFreeTimeGapsForInterval({
          startTime: selectedDate.hour(8).startOf('hour').format(),
          endTime: selectedDate.hour(17).startOf('hour').format(),
          interval: 30,
        });
      }
      setFreeTimesForDate(
        times.map(function (time) {
          return {
            display: dayjs(time.start).format("h:mma"),
            format: dayjs(time.start).format(),
          };
        })
      );
    }
    return (
      <button
        key={day.toString()}
        disabled={available ? null : "disabled"}
        type="button"
        onClick={() => setCalendarDate(displayDate)}
        className={`flex items-center justify-center md:m-2 m-1 h-10 w-10 mx-auto bg-blue-100 hover:bg-blue-200 font-semibold rounded-full text-blue-700 hover:text-blue-800 disabled:text-gray-200 disabled:bg-transparent focus:z-10 ${invisible} ${
          `${selectedDate}` === `${displayDate}`
            ? "border-solid border-2 border-blue-700"
            : ""
        }`}
      >
        <time
          dateTime={d.date(displayDate).format()}
          className="mx-auto flex h-7 w-7 items-center justify-center rounded-full"
        >
          {displayDate}
        </time>
      </button>
    );
  }

  function DisplayDate() {
    if (isError || isLoading) {
      return null;
    }

    function decrementMonth(e) {
      e.preventDefault();
      const newD = d.subtract(1, 'month')
      setD(newD);
    }
    function incrementMonth(e) {
      e.preventDefault();
      const newD = d.add(1, 'month')
      setD(newD);
    }
    return (
      <div className="flex">
        <span>{displayDate()}</span>
        <span className="flex justify-end grow">
          <a href="#" onClick={decrementMonth}>
            <ChevronLeftIcon className="h-5 w-5 mr-5 text-gray-400" aria-hidden="true" />
          </a>
          <a href="#" onClick={incrementMonth}>
            <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </a>
        </span>
      </div>
    );
  }

  function timeConfirmed({ time }) {
    setDrawerIsOpen(false);
    setConfirmedTime(time);
  }

  function TimeButton({ time }) {
    return (
      <button
        type="button"
        className="mb-2 inline-flex items-center rounded border border-transparent bg-blue-100 px-10 py-1.5 text-md font-large text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => {
          url.pathname += 'confirm';
          history.pushState({page: "timeConfirm", drawerisOpen: false}, '', url)
          timeConfirmed({ time });
        }}
      >
        <time dateTime={time.format} className="mx-auto text-center">
          {time.display}
        </time>
      </button>
    );
  }

  function TimeButtons({ times }) {
    const renderedTimes = times.map((time) => {
      return <TimeButton key={time.format} time={time} />;
    });
    return (
      <div className="w-full shadow md:w-1/3 lg:w-1/3 md:px-5 lg:px-5 mx-auto bg-gray-50 py-5 px-10 rounded-r-md flex flex-col">
        {renderedTimes}
      </div>
    );
  }

  function selectedFormattedDate() {
    return `${dayjs(confirmedTime?.format).format(
      "dddd, MMMM D, YYYY [at] h:mma"
    )} ${guessedTimezone}`;
  }

  function ConfirmationForm() {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm();
    return (
      <div
        className={`bg-white py-8 px-4 shadow sm:px-10 grow sm:rounded-lg ${
          !confirmedTime?.format || isEventCreated ? "hidden" : ""
        }`}
      >
        <form
          onSubmit={handleSubmit(mutate)}
          className="space-y-8 divide-y divide-gray-200"
        >
          <div className="space-y-8 divide-y divide-gray-200">
            <div>
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Confirming your chat for:
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedFormattedDate()}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      id="name"
                      disabled={isLoadingForm}
                      autoComplete="given-name"
                      className="block w-full disabled:bg-gray-50 disabled:border-gray-100 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    {errors.name && errors.name.message}
                  </p>
                </div>
                <div className="sm:col-span-6">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email address is required",
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: "Please enter a valid email",
                        },
                      })}
                      disabled={isLoadingForm}
                      id="email"
                      autoComplete="email"
                      className="block w-full disabled:bg-gray-50 disabled:border-gray-100 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    {errors.email && errors.email.message}
                  </p>
                </div>
                <div className="sm:col-span-6">
                  <label
                    htmlFor="details"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Details
                  </label>
                  <div className="mt-1">
                    <textarea
                      type="text"
                      {...register("details")}
                      disabled={isLoadingForm}
                      id="details"
                      autoComplete="details"
                      className="block w-full disabled:bg-gray-50 disabled:border-gray-100 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <div className="mt-1 flex">
                    <button
                      className="transition-all duration-150 ease-out mb-2 inline-flex items-center rounded-md border border-transparent bg-blue-500 px-10 py-1.5 text-md font-large text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
                      type="submit"
                    >
                      {isLoadingForm ? (
                        <SubmitLoading />
                      ) : (
                        <span>Schedule Chat</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  function CalendarDates() {
    const firstDay = firstDayOfMonth();
    const lastDate = lastDateOfMonth();
    const cells = [...Array(42).keys()];
    const listItems = cells.map((day, i) => {
      const invisible =
        i >= firstDay && i + 1 - firstDay <= lastDate ? "" : "invisible";
      return (
        <CalendarDateButton
          key={i}
          invisible={invisible}
          firstDay={firstDay}
          day={day}
          index={i}
        />
      );
    });
    return (
      <>
        {isLoading ? (
          <div className="transition-all flex flex-col justify-center mt-5">
            <Loading />
          </div>
        ) : isError ? (
          <Unauthorized />
        ) : (
          <div
            className={`ease-in duration-300 transition-all isolate mt-2 grid grid-cols-7 md:gap-px rounded-lg text-sm ${
              isLoading ? "scale-0" : "scale-100"
            }`}
          >
            {listItems}
          </div>
        )}
      </>
    );
  }
  function CalendarView() {
    return (
      <div
        className={`bg-white py-8 px-4 shadow sm:px-10 grow ${
          drawerIsOpen ? "sm:rounded-l-lg" : "sm:rounded-lg"
        } ${drawerIsOpen ? "hidden md:block lg:block" : ""}`}
      >
        <div>
          <DisplayDate />
          <DaysOfTheWeek />
          <CalendarDates />
          <p className="mt-10 font-semibold">Timezone</p>
          <p>
            {guessedTimezone} ({displayTime()})
          </p>
        </div>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or check us out on
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <a
                href="https://twitter.com/UpDockCal"
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <span className="sr-only">@UpDockCal on Twitter</span>
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
            <div>
              <a
                href="https://github.com/updock"
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <span className="sr-only">Access our GitHub Repo</span>
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
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
    );
  }

  function BrandLogo() {
    return (
      <svg className="mx-auto h-12 w-auto" viewBox="0 0 234 234">
        <g>
          <path
            fill="none"
            stroke="#c84a67"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M 52.625 8 L 52.625 35.375 M 180.375 8 L 180.375 35.375 M 7 199.625 L 7 62.75 C 7 47.631195 19.256207 35.375 34.375 35.375 L 198.625 35.375 C 213.743805 35.375 226 47.631195 226 62.75 L 226 199.625 M 7 199.625 C 7 214.743805 19.256207 227 34.375 227 L 198.625 227 C 213.743805 227 226 214.743805 226 199.625 M 7 199.625 L 7 108.375 C 7 93.25621 19.256207 81 34.375 81 L 198.625 81 C 213.743805 81 226 93.25621 226 108.375 L 226 199.625"
          />
          <path
            fill="none"
            stroke="#c84a67"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M 108.513687 117.389214 L 108.513687 138.694244 C 108.513702 140.91922 107.629852 143.05307 106.056557 144.626389 L 90.803001 159.879944 M 108.513687 117.389214 C 107.577812 117.474976 106.645676 117.575638 105.717262 117.694962 M 108.513687 117.389214 C 114.094498 116.870262 119.711418 116.870262 125.292229 117.389214 M 125.292229 117.389214 L 125.292229 138.694244 C 125.292229 140.920197 126.175903 143.056671 127.749359 144.626389 L 145.985764 162.862793 M 125.292229 117.389214 C 126.228104 117.474976 127.160248 117.575638 128.088654 117.694962 M 145.985764 162.862793 L 140.131927 164.328125 C 132.328033 166.256531 124.092316 165.340439 116.902962 161.744232 C 109.7136 158.148041 101.47789 157.231918 93.673996 159.160339 L 90.803001 159.879944 M 145.985764 162.862793 L 151.213226 168.09024 C 155.806808 172.683838 153.63678 180.461639 147.234848 181.554108 C 137.2146 183.262268 127.067749 184.119171 116.902962 184.115631 C 106.563644 184.115631 96.429405 183.23941 86.571075 181.554108 C 80.165398 180.461639 77.995377 172.683838 82.592697 168.093979 L 90.803001 159.879944"
          />
        </g>
      </svg>
    );
  }

  function Confirmation() {
    return (
      <div className="flex flex-col mt-1 text-lg text-gray-800 bg-white shadow py-8 px-4 sm:px-10 rounded-lg">
        <div className="flex"><InformationCircleIcon className="h-7 w-7 mr-4 text-blue-500" /> You are confirmed!</div>
        <div className="flex"><CalendarIcon className="h-7 w-7 mr-4 text-blue-500" />{selectedFormattedDate()}</div>
        <div className="flex"><EnvelopeIcon className="h-7 w-7 mr-4 text-blue-500" />Check your email for an invitation.</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl md:max-w-2xl">
          <BrandLogo />
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            Talk with UpDock
          </h2>
        </div>
        <div className="mt-8 md:mx-auto lg:mx-auto flex">
          {!confirmedTime ? <CalendarView /> : null}
          {drawerIsOpen ? <TimeButtons times={freeTimesForDate} /> : null}
          <ConfirmationForm />
          {isEventCreated ? <Confirmation /> : null}
        </div>
      </div>
    </>
  );
}
