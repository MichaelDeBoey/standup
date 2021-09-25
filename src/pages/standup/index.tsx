import React from 'react'

import axios, {AxiosError} from 'axios'
import UnassignedIssues from 'components/UnassignedIssues'
import UserIssues from 'components/UserIssues'
import WelcomeBar from 'components/WelcomeBar'
import {
  JiraProvider,
  useJira,
} from 'hooks/useJira'
import Cookies from 'js-cookie'
import cookies from 'next-cookies'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from 'react-query'

const queryClient = new QueryClient()

function ProjectSelector({selectedProjects}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const {hostUrl} = useJira()

  const {isLoading, isError, data} = useQuery(
    ['projects'],
    async () => {
      const response = await axios.get(`api/projects`)

      return response.data
    },
    {staleTime: Infinity},
  )

  function handleSubmit(event) {
    const form = new FormData(event.target)

    const selectedProjects = Array.from(form.getAll('project')).join(',')

    Cookies.set('projects', selectedProjects, {
      domain: window.location.hostname,
      secure: window.location.hostname !== 'localhost',
      path: '/',
      sameSite: 'strict',
    })
  }

  if (isLoading) return <p> Is loading…</p>

  if (isError) return <p>Is error </p>

  const selectedProjectData = data.values.filter((project) =>
    selectedProjects.includes(project.key),
  )

  const shouldBeOpen = isOpen || selectedProjectData.length === 0

  const DetailsComponent = selectedProjectData.length === 0 ? 'div' : 'details'
  const SummaryComponent = selectedProjectData.length === 0 ? 'div' : 'summary'

  return (
    <DetailsComponent
      onToggle={() => setIsOpen((isOpen) => !isOpen)}
      open={shouldBeOpen}
      className={`${
        shouldBeOpen ? 'bg-gray-50 sm:rounded-md pb-2' : ''
      } bg-opacity-10 -mx-4 `}
    >
      <SummaryComponent
        className={`block px-4 py-2 sm:rounded-md cursor-pointer  ${
          shouldBeOpen ? '' : 'hover:bg-gray-50'
        } hover:bg-opacity-10`}
      >
        {selectedProjectData.length === 0 ? (
          'Choose projects to display'
        ) : (
          <>
            Showing tickets for{' '}
            {selectedProjectData.map((project, i) => (
              <>
                {i !== 0 ? ' and ' : null}
                <a
                  href={`${hostUrl}/browse/${project.key}`}
                  key={project.key}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className={`inline font-semibold  hover:underline text-blue-100 hover:text-white`}
                >
                  {project.name}
                </a>
              </>
            ))}
            .
          </>
        )}
      </SummaryComponent>

      <div className="px-4">
        <form onSubmit={handleSubmit}>
          {data.values.map((project) => (
            <label key={project.key} className="flex items-center mb-2 ">
              <input
                name="project"
                defaultChecked={selectedProjects.includes(project.key)}
                value={project.key}
                type="checkbox"
                className="mr-2 text-blue-900 border-gray-300 rounded shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
              />
              {project.name}
            </label>
          ))}
          <div>
            <button
              type="submit"
              className="px-2 py-1 mx-1 text-xs text-blue-100 bg-blue-900 rounded shadow-sm hover:text-white focus:border-indigo-500 focus:ring-indigo-400 hover:opacity-90 focus:outline-none focus:ring focus:ring-offset-0 focus:ring-opacity-50"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </DetailsComponent>
  )
}

const today = new Date().toLocaleDateString('en-US', {
  month: 'long',
  weekday: 'long',
  day: '2-digit',
})

export default function Standup({users, jiraHostUrl, selectedProjects}) {
  return (
    <div className="bg-gradient-to-tr from-blue-600 to-blue-500 text-gray-50">
      <JiraProvider hostUrl={jiraHostUrl}>
        <QueryClientProvider client={queryClient}>
          <WelcomeBar />
          <header className="bg-gradient-to-tr from-blue-600 to-blue-500 text-gray-50">
            <svg
              width="100%"
              height="200px"
              viewBox="0 0 1280 86"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-0 pointer-events-none max-w-none"
            >
              <g fill="rgba(255,255,255,0.13)">
                <path
                  d="M833.9 27.5c-5.8 3.2-11 7.3-15.5 12.2-7.1-6.9-17.5-8.8-26.6-5-30.6-39.2-87.3-46.1-126.5-15.5-1.4 1.1-2.8 2.2-4.1 3.4C674.4 33.4 684 48 688.8 64.3c4.7.6 9.3 1.8 13.6 3.8 7.8-24.7 34.2-38.3 58.9-30.5 14.4 4.6 25.6 15.7 30.3 30 14.2 1.2 27.7 6.9 38.5 16.2C840.6 49.6 876 29.5 910.8 38c-20.4-20.3-51.8-24.6-76.9-10.5zM384 43.9c-9 5-16.7 11.9-22.7 20.3 15.4-7.8 33.3-8.7 49.4-2.6 3.7-10.1 9.9-19.1 18.1-26-15.4-2.3-31.2.6-44.8 8.3zm560.2 13.6c2 2.2 3.9 4.5 5.7 6.9 5.6-2.6 11.6-4 17.8-4.1-7.6-2.4-15.6-3.3-23.5-2.8zM178.7 7c29-4.2 57.3 10.8 70.3 37 8.9-8.3 20.7-12.8 32.9-12.5C256.4 1.8 214.7-8.1 178.7 7zm146.5 56.3c1.5 4.5 2.4 9.2 2.5 14 .4.2.8.4 1.2.7 3.3 1.9 6.3 4.2 8.9 6.9 5.8-8.7 13.7-15.7 22.9-20.5-11.1-5.2-23.9-5.6-35.5-1.1zM33.5 54.9c21.6-14.4 50.7-8.5 65 13 .1.2.2.3.3.5 7.3-1.2 14.8-.6 21.8 1.6.6-10.3 3.5-20.4 8.6-29.4.3-.6.7-1.2 1.1-1.8-32.1-17.2-71.9-10.6-96.8 16.1zm1228.9 2.7c2.3 2.9 4.4 5.9 6.2 9.1 3.8-.5 7.6-.8 11.4-.8V48.3c-6.4 1.8-12.4 5-17.6 9.3zM1127.3 11c1.9.9 3.7 1.8 5.6 2.8 14.2 7.9 25.8 19.7 33.5 34 13.9-11.4 31.7-16.9 49.6-15.3-20.5-27.7-57.8-36.8-88.7-21.5z"
                  fill-opacity=".5"
                />
                <path d="M0 0v66c6.8 0 13.5.9 20.1 2.6 3.5-5.4 8.1-10.1 13.4-13.6 24.9-26.8 64.7-33.4 96.8-16 10.5-17.4 28.2-29.1 48.3-32 36.1-15.1 77.7-5.2 103.2 24.5 19.7.4 37.1 13.1 43.4 31.8 11.5-4.5 24.4-4.2 35.6 1.1l.4-.2c15.4-21.4 41.5-32.4 67.6-28.6 25-21 62.1-18.8 84.4 5.1 6.7-6.6 16.7-8.4 25.4-4.8 29.2-37.4 83.3-44.1 120.7-14.8l1.8 1.5c37.3-32.9 94.3-29.3 127.2 8 1.2 1.3 2.3 2.7 3.4 4.1 9.1-3.8 19.5-1.9 26.6 5 24.3-26 65-27.3 91-3.1.5.5 1 .9 1.5 1.4 12.8 3.1 24.4 9.9 33.4 19.5 7.9-.5 15.9.4 23.5 2.8 7-.1 13.9 1.5 20.1 4.7 3.9-11.6 15.5-18.9 27.7-17.5.2-.3.3-.6.5-.9 22.1-39.2 70.7-54.7 111.4-35.6 30.8-15.3 68.2-6.2 88.6 21.5 18.3 1.7 35 10.8 46.5 25.1 5.2-4.3 11.1-7.4 17.6-9.3V0H0z" />
              </g>
            </svg>

            <div className="max-w-3xl px-4 py-8 mx-auto">
              <h1 className="py-2 text-6xl font-extrabold">{today}</h1>

              <ProjectSelector selectedProjects={selectedProjects} />
            </div>

            <svg
              width="100%"
              viewBox="0 0 1280 86"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              className="max-w-none"
            >
              <g fill="#ffffff">
                <path
                  d="M1280 66.1c-3.8 0-7.6.3-11.4.8-18.3-32.6-59.6-44.2-92.2-25.9-3.5 2-6.9 4.3-10 6.9-22.7-41.7-74.9-57.2-116.6-34.5-14.2 7.7-25.9 19.3-33.8 33.3-.2.3-.3.6-.5.8-12.2-1.4-23.7 5.9-27.7 17.5-11.9-6.1-25.9-6.3-37.9-.6-21.7-30.4-64-37.5-94.4-15.7-12.1 8.6-21 21-25.4 35.2-10.8-9.3-24.3-15-38.5-16.2-8.1-24.6-34.6-38-59.2-29.9-14.3 4.7-25.5 16-30 30.3-4.3-1.9-8.9-3.2-13.6-3.8-13.6-45.5-61.5-71.4-107-57.8a86.38 86.38 0 0 0-43.2 29.4c-8.7-3.6-18.7-1.8-25.4 4.8-23.1-24.8-61.9-26.2-86.7-3.1-7.1 6.6-12.5 14.8-15.9 24-26.7-10.1-56.9-.4-72.8 23.3-2.6-2.7-5.6-5.1-8.9-6.9-.4-.2-.8-.4-1.2-.7-.6-25.9-22-46.4-47.9-45.8-11.5.3-22.5 4.7-30.9 12.5-16.5-33.5-57.1-47.3-90.6-30.8-21.9 11-36.3 32.7-37.6 57.1-7-2.3-14.5-2.8-21.8-1.6C84.8 47 55.7 40.7 34 54.8c-5.6 3.6-10.3 8.4-13.9 14-6.6-1.7-13.3-2.6-20.1-2.6-.1 0 0 19.8 0 19.8h1280V66.1z"
                  fill-opacity=".5"
                />
                <path d="M15.6 86H1280V48.5c-3.6 1.1-7.1 2.5-10.4 4.4-6.3 3.6-11.8 8.5-16 14.5-8.1-1.5-16.4-.9-24.2 1.7-3.2-39-37.3-68.1-76.4-64.9-24.8 2-46.8 16.9-57.9 39.3-19.9-18.5-51-17.3-69.4 2.6-8.2 8.8-12.8 20.3-13.1 32.3-.4.2-.9.4-1.3.7-3.5 1.9-6.6 4.4-9.4 7.2-16.6-24.9-48.2-35-76.2-24.4-12.2-33.4-49.1-50.6-82.5-38.4-9.5 3.5-18.1 9.1-25 16.5-7.1-6.9-17.5-8.8-26.6-5-30.4-39.3-87-46.3-126.2-15.8-14.8 11.5-25.6 27.4-31 45.4-4.9.6-9.7 1.9-14.2 3.9-8.2-25.9-35.8-40.2-61.7-32-15 4.8-26.9 16.5-31.8 31.5-14.9 1.3-29 7.2-40.3 17-11.5-37.4-51.2-58.4-88.7-46.8-14.8 4.6-27.7 13.9-36.7 26.5-12.6-6-27.3-5.7-39.7.6-4.1-12.2-16.2-19.8-29-18.4-.2-.3-.3-.6-.5-.9-24.4-43.3-79.4-58.6-122.7-34.2-13.3 7.5-24.4 18.2-32.4 31.2C99.8 18.5 50 28.5 25.4 65.4c-4.3 6.4-7.5 13.3-9.8 20.6z" />
              </g>
            </svg>
          </header>

          <div className="py-8 bg-gradient-to-b from-white to-gray-100" />

          <div className="bg-gray-100 sm:py-12">
            <section className="max-w-2xl mx-auto">
              <ul>
                {users.map((user) => (
                  <li key={user.accountId} className="mt-0 sm:mb-12">
                    <UserIssues
                      user={user}
                      disabled={selectedProjects.length === 0}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="py-8 bg-gradient-to-b from-gray-100 to-white" />

          <section className="text-gray-900 bg-gradient-to-tr from-blue-100 to-blue-200">
            <svg
              width="100%"
              height="200px"
              viewBox="0 0 1280 86"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              style={{marginTop: '-1px'}}
              className="pointer-events-none max-w-none"
            >
              <g fill="white">
                <path
                  d="M833.9 27.5c-5.8 3.2-11 7.3-15.5 12.2-7.1-6.9-17.5-8.8-26.6-5-30.6-39.2-87.3-46.1-126.5-15.5-1.4 1.1-2.8 2.2-4.1 3.4C674.4 33.4 684 48 688.8 64.3c4.7.6 9.3 1.8 13.6 3.8 7.8-24.7 34.2-38.3 58.9-30.5 14.4 4.6 25.6 15.7 30.3 30 14.2 1.2 27.7 6.9 38.5 16.2C840.6 49.6 876 29.5 910.8 38c-20.4-20.3-51.8-24.6-76.9-10.5zM384 43.9c-9 5-16.7 11.9-22.7 20.3 15.4-7.8 33.3-8.7 49.4-2.6 3.7-10.1 9.9-19.1 18.1-26-15.4-2.3-31.2.6-44.8 8.3zm560.2 13.6c2 2.2 3.9 4.5 5.7 6.9 5.6-2.6 11.6-4 17.8-4.1-7.6-2.4-15.6-3.3-23.5-2.8zM178.7 7c29-4.2 57.3 10.8 70.3 37 8.9-8.3 20.7-12.8 32.9-12.5C256.4 1.8 214.7-8.1 178.7 7zm146.5 56.3c1.5 4.5 2.4 9.2 2.5 14 .4.2.8.4 1.2.7 3.3 1.9 6.3 4.2 8.9 6.9 5.8-8.7 13.7-15.7 22.9-20.5-11.1-5.2-23.9-5.6-35.5-1.1zM33.5 54.9c21.6-14.4 50.7-8.5 65 13 .1.2.2.3.3.5 7.3-1.2 14.8-.6 21.8 1.6.6-10.3 3.5-20.4 8.6-29.4.3-.6.7-1.2 1.1-1.8-32.1-17.2-71.9-10.6-96.8 16.1zm1228.9 2.7c2.3 2.9 4.4 5.9 6.2 9.1 3.8-.5 7.6-.8 11.4-.8V48.3c-6.4 1.8-12.4 5-17.6 9.3zM1127.3 11c1.9.9 3.7 1.8 5.6 2.8 14.2 7.9 25.8 19.7 33.5 34 13.9-11.4 31.7-16.9 49.6-15.3-20.5-27.7-57.8-36.8-88.7-21.5z"
                  fill-opacity=".5"
                />
                <path d="M0 0v66c6.8 0 13.5.9 20.1 2.6 3.5-5.4 8.1-10.1 13.4-13.6 24.9-26.8 64.7-33.4 96.8-16 10.5-17.4 28.2-29.1 48.3-32 36.1-15.1 77.7-5.2 103.2 24.5 19.7.4 37.1 13.1 43.4 31.8 11.5-4.5 24.4-4.2 35.6 1.1l.4-.2c15.4-21.4 41.5-32.4 67.6-28.6 25-21 62.1-18.8 84.4 5.1 6.7-6.6 16.7-8.4 25.4-4.8 29.2-37.4 83.3-44.1 120.7-14.8l1.8 1.5c37.3-32.9 94.3-29.3 127.2 8 1.2 1.3 2.3 2.7 3.4 4.1 9.1-3.8 19.5-1.9 26.6 5 24.3-26 65-27.3 91-3.1.5.5 1 .9 1.5 1.4 12.8 3.1 24.4 9.9 33.4 19.5 7.9-.5 15.9.4 23.5 2.8 7-.1 13.9 1.5 20.1 4.7 3.9-11.6 15.5-18.9 27.7-17.5.2-.3.3-.6.5-.9 22.1-39.2 70.7-54.7 111.4-35.6 30.8-15.3 68.2-6.2 88.6 21.5 18.3 1.7 35 10.8 46.5 25.1 5.2-4.3 11.1-7.4 17.6-9.3V0H0z" />
              </g>
            </svg>
            <div className="max-w-2xl mx-auto">
              {selectedProjects.length === 0 ? null : <UnassignedIssues />}
            </div>
          </section>
        </QueryClientProvider>
      </JiraProvider>
    </div>
  )
}

export async function getServerSideProps(context) {
  const serverSideCookies = cookies(context)
  if (!serverSideCookies.jiraHostUrl) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  try {
    const response = await axios.get(
      `${serverSideCookies.jiraHostUrl}/rest/api/3/users/search`,
      {
        headers: {
          Authorization: `Basic ${serverSideCookies.credentials}`,
        },
      },
    )

    if (response.status === 200) {
      const users = response.data
        .filter((user) => user.active)
        .filter((user) => user.accountType === 'atlassian')

      const dayOfMonth = new Date().getDate()

      return {
        props: {
          // Rotate users each day so it's always someone new starting
          users: users
            ? [
                ...users.slice(dayOfMonth % users.length),
                ...users.slice(0, dayOfMonth % users.length),
              ]
            : [],
          jiraHostUrl: serverSideCookies.jiraHostUrl,
          selectedProjects: serverSideCookies.projects
            ? serverSideCookies.projects.split(',')
            : [],
        },
      }
    }

    throw new Error('Unsupported response')
  } catch (err) {
    const error = err as AxiosError

    if (error.response) {
      if (error.response.status === 401) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        }
      }
    }

    console.log(error.response)

    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
}
