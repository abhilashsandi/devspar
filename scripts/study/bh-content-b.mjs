// Behavioural guide, part B: leadership, growth, judgement, tricky questions, practice.
// Examples are fictional and generic.
import { P, L, N, T, TRAP, K, RAPID, QUIZ, SAMPLE, REVEAL } from './cc-kit.mjs';
import { Q } from './bh-content-a.mjs';

// ───────────────────────────────────────────── 5. leadership
export const leadership = [
  Q('Tell me about a time you led a project without formal authority.', {
    checking: 'Influence: whether people follow you because you made the goal clear and the work easier, not because of a title.',
    shape: ['The goal and why nobody owned it.', 'How you got **agreement** (a short proposal, a working prototype, a conversation).', 'How you kept people aligned and removed blockers.', 'The outcome, and credit given to others.'],
    example: {
      s: 'Three teams each had their own date formatting and time zone bugs.',
      t: 'Nobody owned it, and I wanted one shared solution.',
      a: 'I wrote a one-page proposal for a shared date utility and asked each team lead what they needed from it. I built the first version using their examples, published it with tests, and moved one team’s code across myself to show it worked. I held a short weekly sync until the other two had migrated.',
      r: 'Time zone bugs in those areas dropped to near zero over the quarter, and the utility became the standard. I made sure the leads presented it at the engineering meeting.',
    },
    avoid: 'Do not claim you “led” something where you only took part. Do not describe instructing people; describe persuading.',
    followUps: ['What if a team had refused?', 'How did you decide the design?', 'What would you do if you had been the manager?'],
  }),
  Q('Tell me about a time you mentored someone.', {
    checking: 'Whether you grow other people and can describe how, not just that you “helped”.',
    shape: ['Who they were and what they were struggling with.', 'What you did (pairing, reviews, a learning plan, stretch tasks).', 'How you adapted as they progressed.', 'Where they got to, in their terms.'],
    example: {
      s: 'A junior engineer on my team wrote working code but struggled with asynchronous bugs.',
      t: 'I was their informal mentor.',
      a: 'We paired for an hour a week on real tickets. I asked them to explain the bug before touching the code, then to write a test that reproduced it. Over a month I stepped back from leading the session to only asking questions. I gave them a small, self-contained feature to own next.',
      r: 'Within six months they were fixing async bugs unaided, and they later reviewed other people’s code on the topic.',
    },
    avoid: 'Do not describe telling them what to do. Mentoring is shown by questions and stepping back.',
    followUps: ['What did you learn from it?', 'What if they had not improved?', 'How do you balance mentoring with your own work?'],
  }),
  Q('Tell me about an unpopular decision you made.', {
    checking: 'Whether you can make a call, explain it, and take responsibility.',
    shape: ['The decision and the reaction.', 'The **reasoning**, including the data.', 'How you communicated it and listened.', 'The outcome, including if it turned out to be wrong.'],
    example: {
      s: 'Our test suite had grown flaky and slow, and new features were landing with little coverage.',
      t: 'As tech lead I decided to pause new features for two sprints to fix the test foundation.',
      a: 'I showed the team and the product manager the incident history and the time lost to reruns. I agreed a fixed end date, a goal (suite under ten minutes, flaky tests quarantined), and listened to concerns about the roadmap. I made the work visible with a weekly burn-down.',
      r: 'The suite dropped from 35 to 9 minutes, release confidence improved, and the next two features shipped faster than planned. A few teammates still thought it cost a launch date, and I agreed it had.',
    },
    avoid: 'Do not describe a decision where you simply overruled people. Show the listening.',
    followUps: ['Who disagreed most, and why?', 'How would you have known if it was a mistake?', 'What if the product manager had said no?'],
  }),
  Q('Tell me about a time you helped a teammate who was struggling.', {
    checking: 'Empathy and practical help, without taking over their work.',
    shape: ['What you noticed and how you approached them privately.', 'What was really in the way.', 'What you did to help.', 'How they recovered, and what you did if they did not.'],
    example: {
      s: 'A colleague’s work slowed noticeably and they stopped speaking in stand-ups.',
      t: 'We sat next to each other and I was worried about them.',
      a: 'I asked them for a walk and said I had noticed things seemed hard. They told me the requirements had been unclear and they were afraid to ask again. We wrote the open questions down together and I went with them to the product manager. I offered to review their work early for a couple of weeks.',
      r: 'They got unblocked, delivered the feature, and began asking questions in stand-up. I told their manager only that they might benefit from clearer specs, with their permission.',
    },
    avoid: 'Do not describe doing their work for them, or reporting them without speaking to them first.',
    followUps: ['What if they had not wanted help?', 'When would you involve their manager?', 'How did you avoid making them feel judged?'],
  }),
  Q('Tell me about a time you delegated something you could have done faster yourself.', {
    checking: 'Whether you scale yourself by developing others, and accept short-term cost for long-term value.',
    shape: ['The task and why you were tempted to keep it.', 'Who you gave it to and why.', 'How you set it up (context, success criteria, check-in points).', 'The result, including how it compared with doing it yourself.'],
    example: {
      s: 'I owned the release process and was doing every release myself.',
      t: 'I wanted two teammates to be able to run releases so I was not a single point of failure.',
      a: 'I wrote the steps down, ran the next release with one teammate watching, then watched them run one. I defined what a good release looked like and when to call me, and I stayed available but did not intervene unless asked.',
      r: 'The first two releases took twice as long, and a mistake in one was caught by the checklist. After that releases rotated weekly and I stopped being the bottleneck.',
    },
    avoid: 'Do not describe delegation as handing off work you did not want.',
    followUps: ['What did you do when something went wrong?', 'How do you decide what to delegate?', 'How do you check without micromanaging?'],
  }),
  QUIZ('Which answer best shows leadership?',
    ['“I made the team follow my design.”', '“I wrote a proposal, listened to concerns from three teams, changed the design, and we shipped it together.”', '“I stayed late to finish it myself.”', '“My manager told me to lead it.”'], 1,
    'Leadership is shown by getting agreement, listening and enabling others. A person, a problem and an outcome beats authority, effort or instruction.'),
];

// ───────────────────────────────────────────── 6. failure, growth, self-awareness
export const growth = [
  Q('What is your biggest failure?', {
    checking: 'Honesty, ownership and learning. They want a real failure with a real consequence, told without blame.',
    shape: ['What you were responsible for.', 'What you got wrong, in your own words.', 'How you handled it once you knew.', 'The specific change in how you work now.'],
    example: {
      s: 'I changed a database index in production on a Friday afternoon to speed up a report.',
      t: 'I was responsible for the change and had tested it only on a small dataset.',
      a: 'The index build locked a busy table and slowed the main application for about twenty minutes. I recognised the cause quickly, cancelled the build, told my manager and the support team right away, and wrote a short incident note. After that I stopped making schema changes late in the week, and started testing on a production-sized copy and using the concurrent index build.',
      r: 'Impact was brief and I handled it openly. It changed how my team plans database changes, and I added a checklist for it.',
    },
    avoid: 'Do not choose a failure that is a disguised strength, or one with no real cost.',
    followUps: ['How did your manager respond?', 'What did the failure cost?', 'Have you made a similar mistake since?'],
  }),
  Q('Tell me about a mistake that reached production.', {
    checking: 'Accountability and engineering maturity: detection, response, and prevention.',
    shape: ['The mistake and what it affected.', 'How it was found and how quickly you acted.', 'What you did to repair the impact.', 'What you changed so the class of mistake cannot recur.'],
    example: {
      s: 'A discount calculation I wrote rounded the wrong way in a rare case.',
      t: 'Customers could be undercharged by a few cents, and I owned the change.',
      a: 'A finance analyst noticed a mismatch in a report. I reproduced it, fixed the rounding, and worked out which orders were affected with a query. I told finance the total impact and agreed they would write it off. Then I added property-based tests for rounding, and put money calculations into one tested module.',
      r: 'The total loss was small, and finance trusted that I had been straightforward. The bug class has not returned.',
    },
    avoid: 'Do not minimise (“it was only a few cents”). Show you cared about the principle.',
    followUps: ['How did you find all the affected cases?', 'Who did you tell, and when?', 'What review did the change go through at the time?'],
  }),
  Q('What is your biggest weakness?', {
    checking: 'Self-awareness and whether you work on your gaps. A real weakness with a concrete mitigation scores best.',
    shape: ['A genuine weakness that is not critical for the role.', 'A short example of when it showed up.', 'What you do about it now.', 'Evidence that it is improving.'],
    example: {
      s: 'I tend to take the hardest part of a project for myself.',
      t: 'It slowed the team and kept others from learning.',
      a: 'After a project where I became the bottleneck, I changed how I plan: I write the design down, split it into whole pieces and hand those over, then review rather than redo. I ask myself who could learn from each task.',
      r: 'On the last project I handed over two substantial parts and stayed on review. Both were delivered well, and I finished my own piece earlier.',
    },
    avoid: '“I work too hard” and “I am a perfectionist” are non-answers. Do not choose a weakness that disqualifies you for the job.',
    followUps: ['How would your manager describe it?', 'What are you still working on?', 'When did it last cause a problem?'],
  }),
  Q('Tell me about a time you learned something quickly.', {
    checking: 'Your learning process, and whether you can become productive in unfamiliar territory.',
    shape: ['What you had to learn and why it was urgent.', 'Your **method**: docs, a small spike, a mentor, reading source.', 'How you applied it before you felt ready.', 'The result and how you shared what you learned.'],
    example: {
      s: 'Our team inherited a service written in a framework none of us had used.',
      t: 'I volunteered to become the person who could fix issues in it within two weeks.',
      a: 'I read the framework’s core concepts and followed one request end to end in the debugger. I wrote a tiny throwaway project to try the parts I did not understand, then fixed a small real bug with a more experienced colleague reviewing. I kept notes and turned them into a short guide for the team.',
      r: 'I was fixing the service’s bugs unaided by the end of the second week, and the guide cut the next person’s ramp-up time.',
    },
    avoid: 'Do not say you learn “quickly” without a method. Describe what you actually did.',
    followUps: ['What was hardest to pick up?', 'How do you decide what to learn deeply versus enough?', 'What are you learning now?'],
  }),
  Q('Tell me about feedback that changed how you work.', {
    checking: 'Whether you seek feedback and let it change you, with evidence.',
    shape: ['The feedback and who gave it.', 'What you did differently.', 'How you checked that it worked.', 'The result others could see.'],
    example: {
      s: 'A reviewer said my pull request descriptions did not explain why a change was made.',
      t: 'I wanted my reviews to be quicker and more useful.',
      a: 'I started writing a short “why” and “how to verify” at the top of every pull request, with a screenshot or test output. I asked two regular reviewers whether it helped, and they asked for the risk to be stated too, so I added it.',
      r: 'Review turnaround dropped from about a day to a few hours, and teammates began copying the format.',
    },
    avoid: 'Do not choose praise dressed as feedback. Pick something that required you to change.',
    followUps: ['How do you ask for feedback?', 'Have you ever disagreed with feedback?', 'What feedback are you working on now?'],
  }),
  RAPID('Rapid-fire: failure and growth', [
    ['Which failures work best?', 'Real ones with a cost, where you owned the cause and changed a habit.'],
    ['Which failures work badly?', 'Disguised strengths, other people’s mistakes, or anything you still do.'],
    ['How do you describe a mistake?', 'What happened, what I did, what I changed. No excuses and no drama.'],
    ['Do you have to name a weakness?', 'Yes. Pick a real one that is not core to the job, with the mitigation.'],
    ['What do interviewers want from a learning story?', 'A method and an outcome, not an adjective.'],
    ['What if you cannot think of a failure?', 'Look at estimates, outages, reviews and miscommunications. There is one.'],
  ]),
];

// ───────────────────────────────────────────── 7. judgement and values
export const judgement = [
  Q('Tell me about a time you traded speed against quality.', {
    checking: 'Pragmatism with a conscience: can you ship, and do you know where the risk is?',
    shape: ['What the pressure was.', 'How you decided what **not** to compromise on.', 'What you deliberately cut or postponed, and how you recorded it.', 'The result, and the debt you paid back.'],
    example: {
      s: 'A customer demo was in four days and the feature was not finished.',
      t: 'I had to decide what to ship in that time.',
      a: 'I would not compromise on correctness or security, so I kept validation and permission checks. I cut the settings page, hard-coded two options we could configure later, and skipped the loading animation. I wrote each shortcut in a ticket with an owner before the demo, so they could not be forgotten.',
      r: 'The demo went well, and we paid back the shortcuts over the next two sprints, with nothing reaching production that could lose data.',
    },
    avoid: 'Do not describe quality as a luxury, or speed as a vice. Show a reasoned line.',
    followUps: ['How did you decide which things were safe to cut?', 'What if the demo had needed the settings page?', 'How do you stop temporary shortcuts becoming permanent?'],
  }),
  Q('Tell me about a time you pushed back on a requirement.', {
    checking: 'Whether you protect users and the business, and how you say no constructively.',
    shape: ['The requirement and the concern.', 'The evidence or risk you brought.', 'An **alternative** you proposed.', 'The decision and what happened.'],
    example: {
      s: 'A stakeholder wanted a data export that included every customer’s personal details for any admin.',
      t: 'I thought it created a privacy risk and was not what they actually needed.',
      a: 'I asked what the export was for. It was for a quarterly review of sign-ups. I proposed an aggregated report plus an export limited to the admin’s own region, with an audit log. I explained the privacy risk in one sentence and showed the effort was the same.',
      r: 'They accepted the narrower version, which met their need, and our security team later cited the audit log as a good example.',
    },
    avoid: 'Do not just say no. Offer an alternative that meets their goal.',
    followUps: ['What if they had insisted?', 'Who else would you have involved?', 'How do you decide what is worth pushing back on?'],
  }),
  Q('Tell me about a time you were asked to cut a corner you thought was unsafe.', {
    checking: 'Integrity and judgement under pressure, and how you escalate.',
    shape: ['What you were asked and why it concerned you.', 'The specific risk, in terms the other person cares about.', 'What you said, to whom, and the alternative.', 'The outcome and what you would do if it had gone the other way.'],
    example: {
      s: 'Before a release I was asked to skip a data migration check to hit the date.',
      t: 'The check had caught real problems before, and a bad migration would corrupt customer records.',
      a: 'I told my manager the specific risk, that a failed migration cannot be rolled back, and offered a way to run the check in parallel with other release work so it added only an hour. I made clear I was not comfortable skipping it and asked who would own that decision if it went wrong.',
      r: 'We ran the check, found a bad row, fixed it, and released an hour later than planned. Nobody asked again.',
    },
    avoid: 'Do not claim you refused and walked away without explanation. Show that you made the cost and risk visible.',
    followUps: ['What if your manager had insisted?', 'Would you have escalated?', 'Have you ever been wrong about the risk?'],
  }),
  Q('How do you use AI-generated code responsibly?', {
    checking: 'Whether you use modern tools well while staying accountable for the result.',
    shape: ['How you use it (planning, scaffolding, tests, review).', '**How you verify**: running it, tests, reading the diff.', 'Your boundaries (no secrets, no production access, no merging unread).', 'An example of catching a problem.'],
    example: {
      s: 'I used an assistant to write a function that parsed dates from user input.',
      t: 'I wanted to speed up the work without lowering the quality bar.',
      a: 'I wrote the cases first: valid dates, a leap day, empty input and a bad format. I let the assistant draft the function, ran my tests, and read the code. It silently accepted impossible dates, so I asked it to validate and added the failing case to the tests. I made sure I could explain every line before opening the pull request.',
      r: 'The feature shipped with a tested parser, and I added the test cases to our shared fixtures. I am accountable for the code whoever typed it.',
    },
    avoid: 'Do not say AI “does the work” or that you never use it. Show a workflow with verification.',
    followUps: ['What would you not use AI for?', 'How do you review AI-generated pull requests from others?', 'What about secrets and customer data?'],
  }),
  QUIZ('Your manager asks you to skip a security check to make a deadline. What is the strongest response?',
    ['Do it quietly and hope nothing happens', 'Refuse and say nothing more', 'State the specific risk, propose a faster way to do the check, and ask who owns the decision', 'Escalate to the CEO'], 2,
    'It protects the business, shows judgement and offers a way forward. Silent compliance and flat refusal both skip the conversation.'),
];

// ───────────────────────────────────────────── 8. tricky and closing questions
export const tricky = [
  K('How do you answer questions about short tenures and gaps?',
    P('Short stints and gaps are common and rarely fatal. What hurts is a **vague or defensive answer**. Be brief, factual and forward-looking.'),
    T(['Situation', 'Say', 'Do not say'], [
      ['Contracts that ended', '“It was a fixed-scope contract and we delivered it.”', 'Apologise for it'],
      ['A layoff', '“The company cut about a third of staff, including my team.”', 'Blame a person'],
      ['A short stint', '“It was not the role I was told it would be, so I moved on once I had delivered X.”', 'Criticise the employer'],
      ['A gap', '“I took time to care for family, and I built X in the meantime.”', 'Over-explain'],
    ]),
    P('Say it in one or two sentences, then steer to what you want next.'),
  ),
  K('How do you answer “what are your salary expectations?”',
    P('Preparation matters more than phrasing. **Research the market range** for the role, level and location before the call.'),
    N('If you can, ask what range the company has budgeted, and let them go first.', 'If you must answer, give a **range** with the bottom at a number you would accept.', 'Say it depends on the whole package: bonus, equity, benefits and flexibility.', 'Avoid naming your current salary where the law allows you to decline.'),
    SAMPLE('A calm way to say it', `
"I would like to understand the role fully first, but based on the market for this
level and location I am looking at roughly X to Y base, depending on the whole
package. What range have you budgeted?"`),
  ),
  K('How do you answer “why should we hire you?”',
    P('Answer with **fit and evidence**, not adjectives. Three points are enough.'),
    N('The problem they have, as you understand it.', 'Your most relevant experience, with one result.', 'How you work with a team, in one sentence.'),
    TRAP('Do not say “I am a hard worker and a fast learner” with nothing behind it. Do not compare yourself to other candidates.'),
  ),
  K('How do you answer “where do you see yourself in five years?”',
    P('They want to know whether the role fits your direction and whether you will grow with the company. Honesty with a sensible frame works best.'),
    L('Talk about **skills and scope**, not titles: more ownership, deeper expertise, perhaps leading.', 'Connect it to what the role can give you.', 'Do not say “in your job”, and do not say you will have moved on.'),
  ),
  K('What questions should you ask them?',
    P('A good question shows you are thinking about the work. Prepare four and choose two or three for each interviewer.'),
    T(['Ask', 'Question'], [
      ['**Hiring manager**', 'What would you want me to have delivered in the first 90 days? What is the hardest problem the team has right now?'],
      ['**Engineers**', 'How does a change get from idea to production? What do you wish were better about the codebase? How do you use AI tools day to day?'],
      ['**Product or design**', 'How are priorities set, and how do engineers help shape them?'],
      ['**Anyone**', 'How is ownership split between frontend and backend? What does on-call look like?'],
    ]),
    TRAP('Do not ask about salary, holidays or perks of the first interviewer, or ask something answered on their website.'),
  ),
  RAPID('Rapid-fire: closing questions', [
    ['Do you have any questions for us?', 'Always yes. Ask about the work and the team.'],
    ['When can you start?', 'Say your notice period honestly, and offer to help the handover.'],
    ['Are you interviewing elsewhere?', 'Yes, honestly, without names. Say this role is a strong fit and why.'],
    ['What motivates you?', 'A specific kind of work you have done and enjoyed, not a general word.'],
    ['What would your colleagues say about you?', 'Two traits, each with a short example.'],
    ['Anything else you want us to know?', 'One sentence that reinforces your strongest fit, or “no, thank you”.'],
  ]),
];

// ───────────────────────────────────────────── 9. practice: rewrite the answer
export const practice = [
  K('Rewrite: a vague teamwork answer',
    P('Read the answer below and say out loud what is wrong with it. Then open the diagnosis.'),
    SAMPLE('Question: Tell me about a time you worked in a team', `
"I work well in teams. In my last project we all worked together and communicated
well and the project was a success. I always try to help everyone and I think good
communication is the key to good teamwork."`),
    REVEAL('Show what is wrong and a stronger version',
      '<ul><li>It has **no situation, no action and no result**. It is a set of claims about yourself.</li><li>There is **no “I”**: the interviewer cannot tell what you did.</li><li>“Communicated well” and “a success” are adjectives, not evidence.</li></ul>',
      SAMPLE('A stronger version', `
"On our checkout redesign, three of us worked across front end, API and design.
We kept missing each other's changes, so I proposed a 15-minute sync twice a week
and a shared list of API changes. I also paired with the designer on the error
states so they matched what the API really returned. We finished a week early,
and the number of integration bugs in testing fell from about ten to two."`)),
  ),
  K('Rewrite: a failure answer that blames others',
    SAMPLE('Question: Tell me about a time you failed', `
"We missed a deadline once because the requirements kept changing and the product
manager did not give us a clear spec. I did everything I could but it was out of my
hands."`),
    REVEAL('Show what is wrong and a stronger version',
      '<ul><li>Every cause is **someone else**. The interviewer hears no ownership and no learning.</li><li>“Out of my hands” is the opposite of what a failure question wants.</li><li>There is **no change** in how you work afterwards.</li></ul>',
      SAMPLE('A stronger version', `
"We missed a deadline by two weeks. The requirements changed during the work, and I
had estimated without asking for a firm scope. When the changes came I did not flag
the impact early. Now I ask what is fixed before I estimate, I write assumptions
into the estimate, and when scope changes I tell the product manager the cost the
same day. My last three projects have landed within a few days of the estimate."`)),
  ),
  K('Rewrite: a conflict answer with no outcome',
    SAMPLE('Question: Tell me about a disagreement with a colleague', `
"A colleague and I disagreed about how to structure the code. I thought my way was
better, and I explained it carefully, and eventually they understood. It was a good
learning experience."`),
    REVEAL('Show what is wrong and a stronger version',
      '<ul><li>The colleague is described as someone who needed to **come round**. They do not sound reasonable.</li><li>There is **no evidence** and no outcome: what did you build, and what happened?</li><li>“A good learning experience” says nothing about what was learned.</li></ul>',
      SAMPLE('A stronger version', `
"A colleague wanted a shared state store for the whole app, and I wanted state kept
close to each feature. They were worried about duplicated logic, which was fair. We
built the same screen both ways in an afternoon and compared them. Their approach was
better for the three screens that shared data, so we used a store only there. We
wrote the rule down for the team, and I now start with a spike when we disagree."`)),
  ),
  K('What are the red flags interviewers write down?',
    P('Interviewers fill in a form after the interview. These are the notes that most often sink an otherwise good candidate.'),
    L('**Never says “I”**: cannot separate their work from the team’s.', '**Blames others** for every problem or failure.', '**No real failure** or weakness, or a disguised strength.', '**Criticises** a former employer, manager or colleague.', '**Cannot give a result** or any number.', '**Rambles** past three minutes without reaching the action.', '**Story falls apart** under a follow-up question.', '**Rehearsed to the word**: sounds recited, not remembered.'),
    P('Most of these are fixed by the same habit: prepare six stories, know each one a level deeper than you plan to say, and tell it in your own words.'),
  ),
  RAPID('Rapid-fire: the day before', [
    ['Stories', 'Six to eight, each tagged by competency, each practised at 90 seconds out loud.'],
    ['Numbers', 'One result per story, and a line on how it was measured.'],
    ['Your introduction', 'A 75-second version and a 30-second version.'],
    ['Why this company', 'Two specifics, one about the work and one about the team.'],
    ['Hard questions', 'Reason for leaving, gaps, salary range, strongest weakness.'],
    ['Questions for them', 'Three, tailored to each interviewer.'],
    ['Logistics', 'Interviewers’ names, the format, and a quiet place with a good connection.'],
    ['Sleep', 'Seriously: a calm answer beats a better rehearsed one.'],
  ]),
];
