# Stack

- React Router 7 (Framework mode | ssr:true)
- Sqlite with prisma
- shadcn/ui
- vercel ai sdk
- socket.io
- webrtc

# App description - overview of the idea

## Core Idea

This App is an AI-powered mobile and web platform that transforms how people learn together. It combines small, private study groups (max 20 users), open public forums, and a solo learning mode, all enhanced by a context-aware AI assistant that curates resources, answers questions, and structures knowledge. Think Discord for focused learning communities, fused with Khan Academy’s content depth, but driven by real-time collaboration and AI personalization. This app fills the gap between fragmented collaboration tools and static e-learning platforms, creating vibrant, privacy-first learning hubs for students, professionals, and lifelong learners.

## Unique Value Proposition (UVP)

Unlike general collaboration tools (Discord,Slack) or static e-learning platforms (Coursera, Khan Academy),
this App combines real-time group learning, AI-driven personalization, and structured content creation in a privacy first environment tailored for small, focused study groups.

## Target audience

- Students (high school, college, lifelong learners) seeking peer study groups.
- Professionals upskilling in niche areas (e.g., coding, data science, philosophy).
- Hobbyists exploring topics like astrophysics or literature collaboratively.
- Educators or institutions wanting structured group learning environments.

## App features

- **Private rooms (Learning Pods)**

  - Users create or join small groups (up to 20 members) for focused study on any topic, from quantum physics to Python.
  - Features:
    - Real-time text chat for discussions.
    - AI assistant answers questions, suggests resources (articles, videos), and summarizes sessions (e.g., “Key points from today’s calculus discussion”).
    - Privacy controls allow groups to keep content private or share insights publicly.
    - Structured organization via shared notes and topic folders.
  - Example: A college student joins a “Machine Learning Basics” room, collaborates with peers, and uses the AI to clarify neural networks while saving group notes for later review.

- **Public Rooms (Community Hubs)**

  - Open forums categorized by topic (e.g., Science, Coding, Philosophy) where users share ideas, ask questions, and learn broadly.  
    -Features: - AI moderates discussions, flagging spam or off-topic posts. - Searchable topic hubs surface high-quality content. - Users can post insights from private rooms or solo study, fostering cross-pollination.
  - Example: A hobbyist joins the “Astrophysics” public room, discovers a thread on black holes, and engages with AI-curated resources alongside community input.

- **Solo Mode (Personal study hub)**
  - A private space for independent learning, ensuring the app is valuable even without immediate group engagement.
  - Features:
    - Text-based chat with the AI for contextual Q&A and resource suggestions.
    - Topic/project folders organize notes, AI-generated summaries, and resources (e.g., “Graph Theory” folder with notes and links).
    - Users can share solo content to private or public rooms, transitioning to collaboration.
    - Basic progress tracking (topics studied, sessions completed).
  - Example: A professional learns “Blockchain Fundamentals” solo, organizes notes in a folder, and later shares a summary with a private room to start a study group.

## MVP

- Features: Private rooms, public rooms, Solo Mode with topic folders, AI assistant (Q&A, resources, summaries), basic profiles, notifications.

# App structure

## 3-column layout

- Left column is the Icon sidebar
- Next to it the content sidebar - provides more info and context menu for the icon links.
- the last column is the main content area. (can be one main area or seperated with the twocolumn layout to two columns)

### Files and logic (how it is strucutred)

- **routes.ts**: this is where all the routes get configured. Using the configurational route declaration. Similar to file based routing but configured in the route.ts file. No need to remember the file based syntax like $ and dot notation.
- **routes folder** contains all the declared routes in the routes.ts (you can use loaders and actions only in this files.)
- **routes/dashboard** folder you will find the index.ts and layoput.ts for the dashboard route.
  - **layout.ts**: contains the Sidebarprovider with an outlet.
  - every new route for example /projects or /notes or even the index.ts which would be the /dashboard has to render the **<Applayout/>** with the content prop and an additional Outlet. The content prop get the panelContent for contentSidebar.
  - **applayout.ts** contains the Appsidebar component which are the contentand iconsidebar. It also has the Sidebarinset with a children prop. This siebarinset with children is the mainarea content.
  - So I used this structure because there are no named outlets available for react router yet like in angular. I couldn't use Outlets for both sidebars and then also for the main area. So I needed to use props and children to be able to use two sidebars sahring information with each other and updating the content for the main area. Also considering the rerendering when doing CRUD operations -> this was the best solutions I got for this layout.

## What is done, what are the issues and what has to be done

### Authentication

- [x] Password and email authentication and saving in the sqlite DB
- [x] googleprovider login/signup
- **Issues**:
- [] image uploading -> the resource route under routes/resources/user-image.tsx returns somwhow a content of html/text isntead of image/png (check the network tab on the browser). Changing the image or uploading is done at the /profile route. You can find it at the user-dropdown menu on the iconsidebar menu at the top.

### Solo mode ai responses

- [x] showing and saving ai and user messages in the ui
- **Issues**:
- [] when sending the message and after getting the message from the open ai api the site refreshes. It shouldn't because using of fetcher.Form. This needs to be fixed.
- [] streaming didn't work with a resources route because of refreshing! Once the refreshing issue is reloved -> streaming responses should be implemented.

**Other task**:

- changing ai models and saving in db for the chatid
- to be able to use his own apikeys form the models. Providing it in the profile page or settings. (some models are provided by us and other should be accesible through own api keys or limiting the use of llm and if more usage required the user should be able to use his own apikey).
- changing form solo mode to group mode. Inviting people to chat.
- right side of the twocolumnlayout: Editor,Summary and Notes
  - Editor: either using **tiptap or lexical** (https://playground.lexical.dev/) (https://tiptap.dev/docs/examples/advanced/menus)
  - Summary: should be delivered form the ai given the chat content with a timeline. Given a context for the user of the chat etc.
  - Notes: users should be able to create additional notes to the chat and insert and save images.
  - **Linking** the left chat and the right panels with each other! AI context provider!
- changing the chat from private to public functionality.

### Group mode

- users should be able to invite people to a chat. (not only to fresh chats but also to chats which started in solo mode.)
- textarea need a functionality for sending a message to user or ai? maybe a @ai before shortcut before sending the message or a sswitch component ro combobox?
- public and private mode.

### Chat management

- chat listing on the content sidebar.
- chat url with dynamic id
- deleting chats (probably at the content sidebar)
- creating folders and inside chats.
- either using react-aborist: https://github.com/brimdata/react-arborist or origin-ui: https://originui.com/tree

On the projects route you can careate projects and inside projects list and organize chats.
On the notes route you can quick draft ideas with cahts without project folders. But you should be ablke then to send the note/draft.chat to a project if you want alter on.

## ENV Variables

- BASE_URL= http://localhost:5173
- DATABASE_URL= "file:./data.db"
- GOOGLE_CLIENT_ID= your-google-client-id
- GOOGLE_CLIENT_SECRET= google key
- VITE_OPENAI_API_KEY = your-openai-key
