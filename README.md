# POWR - Progressive Overload Workout Recorder

Progressive Overload is a concept in resistance training where the exercise volume (reps x weight) increases each workout ensuring muscles are always being challenged and grow over time.

The Progressive Overload Workout Recorder (POWR) is an app that aims to record workout data of major exercises, such as deadlift or benchpress, to help achieve progressive overload since the last workout and display this data over time using an attractive and minimalist interface.

## Development

This app is being developed in Cursor IDE with assistance from the Cursor agent. The agent is instructed to follow the rules laid out in ./cursor/rules/rules.mdc.

The agent is instructed to check the Product Requirement Document (PRD) in docs/PRD which describes in detail how the app should function.

The files in docs/learnings-1.md are logs of the step by step progress made and updated and checked by agents during development.

## Future Features

    - Data export function
    - Create workout routines
    - Develop landing page
    - Mobile app development

## Inspiration

This project was an idea I've had for a long time and attempted to build a few years ago but did not complete a functional product I was happy with. Here is the [repo](https://github.com/michagodfrey/powr) for the first version. As you can see, POWR 2.0 is quite an upgrade.

## Screenshots

### Minimalist Dashboard

![Dashboard](/docs/screenshots/dashboard.png)

### Display exercise progress over weeks, months and years

![Exercise detail page](/docs/screenshots/exercise-detail.png)

### Choose between light/dark theme and kg/lb

![Settings page](/docs/screenshots/settings.png)

### Total volume each workout can be displayed in a bar chart

![Dark theme bar graph](/docs/screenshots/exercise-dark-bar.png)

### Use slider to specify time period

![Slider](/docs/screenshots/exercise-slider.png)

### Creating a new workout session

![Create workout session](/docs/screenshots/create-workout.png)

### Login

![Login page](/docs/screenshots/login.png)

### Logo

POWR logo created by [Logo](https://logo.com/)

![POWR logo.](/docs/screenshots/powr-logo.jpg)

## Main Takeaways using Cursor IDE

Using an agent to help me code has been a game changer and is how I will develop apps from now on. It accelerates my work, helps keep me engaged because I get stuck less and if you let it, will act a kind of tutor. At times it seemed to be explaining code and *what to do* rather than *here's the code accept the change*.

The PRD and rules worked well, but I noticed I needed to keep dragging the agent's attention to it. The biggest problems in development came up when I got complacent with accepting changes without fully understanding what was being done.

Below are few reflections I have on using Cursor IDE with help from it's Agent.

### Make sure you have the crucial files added to the chat

It's easy to assume that the Agent is going to see all the things you see and what is obvious to you must be obvious to the agent. In building this app, I've found that while chats do have some memory (but it's still good to keep them short), you need to keep adding the relevant files and lines of code to the next chat and always aim to give as much *relevant* content to do the job.

### Be Proactive and vigilant about all the changes the agent is doing

Point out all the problems and add relevant files and lines to the chat. I got the impression the agent doesn't read things you give it unless it thinks it has to.

### The Agent can go crazy

One example to illustrate this point: After finally debugging a major issue, there was one file import that was flagging an error, even though it should have been working. It looked unfixable, so brought it the attention of the agent who was also baffled and wanted to go on a rampage of changes when a simple retyping of the import fixed it.

**Control the agent or it will control you!**
