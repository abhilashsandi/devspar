// Behavioural guide, part A: method, introducing yourself, ownership, collaboration.
// All worked examples are fictional and generic. Nothing here comes from a real person's history.
import { P, L, N, T, TRAP, K, RAPID, QUIZ, DIAGRAM, GO } from './cc-kit.mjs';
import { BH } from './dg-bh.mjs';

// One behavioural question: what it checks, the shape of a strong answer, a fictional STAR example, what to avoid.
export const Q = (title, { checking, shape, example, avoid, followUps }) => K(title,
  P('**What they are checking:** ' + checking),
  P('**Shape of a strong answer:**'), N(...shape),
  T(['', 'A worked example (fictional)'], [['**Situation**', example.s], ['**Task**', example.t], ['**Action**', example.a], ['**Result**', example.r]]),
  P('Replace this with a real story of your own. An invented one does not survive the first follow-up.'),
  TRAP(avoid),
  P('**Expect next:**'), L(...followUps));

// ───────────────────────────────────────────── 1. method
export const method = [
  K('What are behavioural interviews for, and what do interviewers score?',
    P('A behavioural interview asks about **what you did in the past** as evidence for how you will work. The interviewer is not collecting stories. They are scoring a few signals, usually against a written rubric.'),
    T(['Signal', 'What evidence shows it'], [
      ['**Ownership**', 'You noticed a problem nobody assigned and followed it through to the outcome'],
      ['**Collaboration**', 'You changed your mind, or someone else’s, without damaging the relationship'],
      ['**Judgement**', 'You chose between options with a reason, and you can say what you gave up'],
      ['**Growth**', 'A mistake or piece of feedback changed how you work afterwards'],
      ['**Communication**', 'The story was easy to follow and the interviewer never had to dig for your part in it'],
    ]),
    P('Every question in this guide maps to one or more of these. If you can say which signal a question is after, you already know what the answer needs to contain.'),
  ),
  DIAGRAM('The STAR structure', BH.star,
    P('**Situation, Task, Action, Result** keeps a story in order. The proportions matter more than the labels.'),
    N('**Situation (one sentence):** where and when, only enough context to make the rest make sense.', '**Task (one or two sentences):** what you were responsible for, and what success looked like.', '**Action (most of the answer):** what **you** did, in order, with the reasons for your choices. Say “I”.', '**Result:** what happened, with a number if you have one, and what you took from it.'),
    TRAP('Candidates spend two minutes on the situation and ten seconds on the action. The interviewer then has nothing to score.'),
  ),
  DIAGRAM('Build a story bank, not a script per question', BH.storyBank,
    P('You cannot rehearse an answer for every question, and you should not try. Prepare **six to eight stories** and learn to tell each one from several angles.'),
    N('List projects, incidents, disagreements and changes you led from the last three or four years.', 'Pick the ones where you had a real part and a clear outcome.', 'For each, note which competencies it can evidence (the matrix above).', 'Practise each story at **90 seconds**, with the action as the longest part.', 'In the interview, choose the story that fits the question; do not recite the same one three times.'),
    GO(['/stories', 'Story bank: write your stories here and check their shape']),
  ),
  K('How long should an answer be, and how do you handle follow-ups?',
    P('Aim for **90 seconds to two minutes**. Shorter feels thin; longer loses the interviewer. Stop when the result is told and let them ask.'),
    DIAGRAM('How interviewers probe a story', BH.probes).a,
    L('**Follow-ups are a good sign.** They mean the story was interesting enough to dig into.', 'Answer the question you were asked, in a sentence, then add one detail.', 'If you do not remember a detail, say so. Inventing one is worse.', 'If a follow-up reveals a mistake, own it and say what you would do now.'),
  ),
  QUIZ('Which part of a STAR answer should take the most time?',
    ['The situation, so the interviewer understands', 'The task', 'The action: what you did', 'The result'], 2,
    'The action is the only part that shows how you work. Situation and task are context, and the result is a short close.'),
];

// ───────────────────────────────────────────── 2. introducing yourself
export const aboutYou = [
  K('Tell me about yourself.',
    P('This is not a request for your life story. It is a request for a **short, relevant pitch**, and it sets the tone for the rest of the interview.'),
    DIAGRAM('Present, past, future', BH.aboutYou).a,
    P('**A 75-second example (fictional):**'),
    L('**Present:** “I am a full-stack engineer on a team of eight building a subscription billing product, mostly React and Node.js. Lately I have been leading the move from a monolith to separate services for invoicing.”', '**Past:** “Before that I spent three years at an online retailer, where I built the checkout front end and cut its load time by about a third. That is where I got interested in performance and in working close to the back end.”', '**Future:** “I am looking for a role where I can own features end to end and work on a product with real scale, which is why this one caught my eye.”'),
    TRAP('Do not walk through every job, mention your age or family unless you want to, or end without saying why this role. Replace the example with your own facts.'),
  ),
  K('Walk me through your CV.',
    P('This is the same question with more room. Go **reverse-chronologically**, with one thread running through it, and spend your time on the last two roles.'),
    N('Start with the current role: what you own, the stack, and one result.', 'One sentence per earlier role: why you moved, and what you gained.', 'Name the thread: for example “I keep ending up on the hard integration problems”.', 'Finish on why you are here, which hands the conversation back.'),
    L('Know your dates and your reasons for each move.', 'Cut older roles to a clause if they are not relevant.', 'Explain gaps in one honest sentence and move on.'),
  ),
  Q('Why do you want this role, and why this company?', {
    checking: 'Whether you have chosen them or are applying everywhere, and whether your motives match what the job really is.',
    shape: ['One thing about the **work** that attracts you (the problem, the stack, the scale).', 'One thing about the **company or team** you can point to (a product, a talk, a way of working).', 'How your experience connects to it, in a sentence.'],
    example: {
      s: 'The company runs a logistics platform that I have used from the customer side.',
      t: 'I was asked why I wanted to move from retail into logistics software.',
      a: 'I said the route-planning problem interests me because it mixes real-time data with a UI people depend on all day. I mentioned their engineering post on moving to event-driven tracking, which is close to a migration I led, and that I wanted a team where backend and frontend engineers share ownership.',
      r: 'The interviewer moved straight into the tracking architecture, which turned a generic question into a technical conversation I was well prepared for.',
    },
    avoid: 'Do not say “great culture” or “growth opportunities” without a specific. Do not flatter; be precise. Do not mention salary or the commute as the reason.',
    followUps: ['What would you want to work on in your first six months?', 'What do you know about our product or competitors?', 'What else are you considering?'],
  }),
  Q('Why are you leaving your current job?', {
    checking: 'Whether you leave for good reasons and speak about people fairly. Bitterness is the red flag.',
    shape: ['A **positive, forward-looking** reason, stated in one sentence.', 'Something true that you are not running from.', 'A tie to what this role offers.'],
    example: {
      s: 'I had been on the same internal platform team for four years.',
      t: 'The interviewer asked why I was looking, since the team seemed to value me.',
      a: 'I said the platform was stable and my work had become mostly maintenance. I had learned what I could there, and I wanted to build user-facing features again, with more product involvement. I said I was grateful for the team and gave notice of the handover work I had already planned.',
      r: 'It came across as growth-driven, with no criticism of anyone, and led to a conversation about the product work I wanted.',
    },
    avoid: 'Never criticise a manager, team or client, even when it is deserved. “I was laid off” or “the contract ended” are complete, honest answers when true.',
    followUps: ['What would make you stay in a role?', 'How did you raise this with your manager?', 'What did you not get in your last role that you want here?'],
  }),
  Q('Tell me about a project you are proud of.', {
    checking: 'What you value, the scale of what you have done, and whether you can explain your own contribution.',
    shape: ['Name the project and **why it mattered** in one sentence.', 'Say what was hard about it.', 'Describe your part concretely, including a decision you made.', 'Give the outcome with a number and what you would change.'],
    example: {
      s: 'Our import feature for customer data timed out for any file over a few thousand rows.',
      t: 'I took ownership of redesigning it, with two weeks before the biggest customer onboarded.',
      a: 'I measured where the time went and found that each row triggered its own database round trip. I moved the work to a background job, processed rows in batches, and streamed progress back to the browser so users could see it advance. I wrote a load test with a 200,000-row file before changing anything, so I could prove the improvement.',
      r: 'Imports of 200,000 rows went from failing after a minute to finishing in under 40 seconds, and the customer onboarded on time. I learned to build the measurement first.',
    },
    avoid: 'Do not pick a project where you cannot say what you personally did. Do not describe a team success without your part in it.',
    followUps: ['What was the hardest technical decision?', 'What would you do differently?', 'Who disagreed with you, and what happened?'],
  }),
  RAPID('Rapid-fire: introducing yourself', [
    ['How long should “tell me about yourself” be?', '60 to 90 seconds.'],
    ['What do you end on?', 'Why this role. It hands the conversation back.'],
    ['You were on contract roles. What do you say?', 'Say they were fixed-scope engagements, name what you delivered, and say you want a long-term role.'],
    ['You have a career gap.', 'One honest sentence about what it was and what you did, then move on.'],
    ['You are switching stack.', 'Name what transfers, what you already built in the new stack, and how you learn quickly.'],
    ['Can you criticise a former employer?', 'No. Describe what you wanted instead of what you disliked.'],
  ]),
];

// ───────────────────────────────────────────── 3. ownership and delivery
export const ownership = [
  Q('Tell me about a time you worked to a tight deadline.', {
    checking: 'How you prioritise, whether you communicate early, and what you cut and why.',
    shape: ['The fixed date and what depended on it.', 'How you **scoped**: what had to ship and what could wait.', 'What you told stakeholders, and when.', 'The result, including anything you deliberately left out.'],
    example: {
      s: 'A partner integration had to go live in three weeks for a contractual launch.',
      t: 'I was the lead engineer for the front end and had to deliver the user-facing flow.',
      a: 'I split the work into must-have (sign-up, the main action, an error state) and later (settings, analytics). I agreed the list with the product manager in the first two days, mocked the partner’s API so I could build in parallel, and told the team at once when a dependency slipped by three days so we could re-plan instead of hoping.',
      r: 'We launched on the date with the must-have set. The deferred items shipped two weeks later without incident.',
    },
    avoid: 'Do not describe heroics and unpaid weekends as the answer. Interviewers read that as poor planning.',
    followUps: ['What did you cut, and who agreed?', 'What would you do if the deadline were moved forward again?', 'How did you keep quality up?'],
  }),
  Q('Tell me about a time you had unclear requirements.', {
    checking: 'Whether you reduce ambiguity yourself or wait to be told, and how you manage risk while you learn.',
    shape: ['What was unclear and why it mattered.', 'The **questions** you asked and to whom.', 'How you made progress anyway (a prototype, an assumption you wrote down).', 'What you learned and how the requirement settled.'],
    example: {
      s: 'The request was “make reporting faster”, with no more detail.',
      t: 'I was asked to propose and deliver the work.',
      a: 'I asked three customers which reports they ran and how long they waited, then pulled the slowest ones from our query logs. Two reports caused most of the complaints. I wrote my assumptions in a one-page note, got the product manager to confirm them, and built a small prototype for the slowest report to check that a summary table would be fast enough.',
      r: 'The work shrank from a vague platform project to two targeted fixes. Both reports dropped from about 30 seconds to under 3, and I kept the note as the design record.',
    },
    avoid: 'Do not say you “just figured it out”. Show the questions you asked and the assumption you wrote down.',
    followUps: ['What if the requirements had changed halfway?', 'Who did you go to for answers?', 'How do you decide when you know enough to start?'],
  }),
  Q('Tell me about a project that slipped or failed.', {
    checking: 'Honesty, accountability, and whether you learn. They are reading how you describe your own part.',
    shape: ['What the project was and what went wrong, plainly.', '**Your part** in it, without hiding behind others.', 'What you did once you saw it slipping.', 'What you now do differently, with an example.'],
    example: {
      s: 'We planned a six-week rewrite of a settings area and it took ten.',
      t: 'I had estimated it and was leading the work.',
      a: 'I had estimated from the happy path and missed the edge cases around permissions. When I was two weeks behind I told my manager that day with a revised plan and two options: cut a feature or add a week. We cut a feature. Afterwards I started listing unknowns in every estimate and adding a buffer for them.',
      r: 'We shipped four weeks late rather than finding out at the end. My next three estimates came in within a few days.',
    },
    avoid: 'Do not choose a failure that is secretly a success, and do not blame the requirements, the other team or the tools.',
    followUps: ['When did you first know it was slipping?', 'How did your manager react?', 'What would you have done at the start?'],
  }),
  Q('Tell me about a production incident you handled.', {
    checking: 'Calm under pressure, a systematic approach, and whether you fix the cause and prevent a repeat.',
    shape: ['The **impact** in user terms and how you found out.', 'How you **mitigated first** (rollback, flag, scale), before finding the cause.', 'How you found the root cause.', 'The fix, and what you changed so it cannot silently recur.'],
    example: {
      s: 'On a Monday morning, checkout errors rose to 8% after a release.',
      t: 'I was on call and the first responder.',
      a: 'I checked the release time against the error graph, saw they matched, and rolled back through the feature flag within ten minutes. Errors returned to normal. Then I reproduced it in staging and found a new field the payment provider rejected when a coupon was applied. I fixed it, added a test for that combination, and added an alert on the checkout error rate.',
      r: 'Customer impact lasted about 12 minutes. The new alert caught a similar issue the next quarter in under two minutes.',
    },
    avoid: 'Do not start with the root cause when the question is about the incident. Mitigation first, cause second, prevention third.',
    followUps: ['How did you communicate during the incident?', 'What was the hardest decision you made?', 'What did the post-incident review change?'],
  }),
  Q('Tell me about a time you went beyond your role.', {
    checking: 'Initiative, and whether you create value without being asked, while respecting other people’s areas.',
    shape: ['The problem you noticed that nobody owned.', 'Why you acted and who you told.', 'What you did, and how you involved the people who owned the area.', 'The result and what the team did with it.'],
    example: {
      s: 'Our onboarding emails often arrived late, but they belonged to the growth team.',
      t: 'It was not my area, but sign-up drop-off was a metric we all shared.',
      a: 'I traced a sample of emails and found a queue backing up behind a nightly job. I wrote up what I found, with the traces, and showed it to the growth team’s lead instead of changing their code. I offered to pair on the fix, and we moved the job to a separate queue together.',
      r: 'Email delay dropped from about an hour to under a minute, and sign-ups completed rose slightly. The growth team added the trace to their runbook.',
    },
    avoid: 'Do not describe overriding someone else’s decision or doing their job without telling them.',
    followUps: ['How did the other team react?', 'What if they had said no?', 'How did you balance this with your own work?'],
  }),
  Q('Tell me about a time you had competing priorities.', {
    checking: 'How you decide what matters, and whether you make trade-offs visible instead of silently dropping work.',
    shape: ['The competing demands and who was asking.', 'The **criteria** you used to rank them (impact, deadline, risk).', 'How you communicated the decision.', 'The outcome, including what had to wait.'],
    example: {
      s: 'In one week I had a security patch, a promised customer feature and a bug in the admin tool.',
      t: 'All three had owners asking for them first.',
      a: 'I ranked them by risk and deadline: the patch had an external date and real exposure, the customer feature had a committed date next week, and the admin bug had a workaround. I told all three requesters the order and the reason, and gave the admin team the workaround steps while they waited.',
      r: 'All three were delivered, the admin bug a week late. Nobody was surprised, because they had heard it from me first.',
    },
    avoid: 'Do not say you “worked harder” to do everything. Interviewers want to see how you choose.',
    followUps: ['What if two stakeholders both insisted theirs was first?', 'Who made the final call?', 'What would you have done if the patch had taken longer?'],
  }),
  QUIZ('A story ends with “and the project was a big success”. What is missing?',
    ['A longer situation', 'A concrete result, ideally with a number, and what you learned', 'The names of everyone involved', 'An apology for the delay'], 1,
    '“A big success” is a claim. A result shows it: what changed, by how much, and what you would carry forward.'),
];

// ───────────────────────────────────────────── 4. collaboration and conflict
export const collaboration = [
  DIAGRAM('How to tell a conflict story', BH.conflict,
    P('Conflict questions test whether you can disagree **without damaging the relationship**. Interviewers listen for how you describe the other person.'),
    L('Describe their position **fairly**, in terms they would accept.', 'Show that you used **evidence or a small experiment**, not volume.', 'Say how the decision was made and who made it.', 'Say what happened to the working relationship afterwards.'),
    TRAP('Do not tell a story where you were right and the other person was foolish. Even if it is true, it reads as someone hard to work with.'),
  ),
  Q('Tell me about a disagreement with a teammate about a technical approach.', {
    checking: 'Whether you argue from evidence, stay open to being wrong, and keep the relationship intact.',
    shape: ['The decision and the two positions, stated fairly.', 'What you did to **resolve it with evidence**.', 'How the decision was made.', 'What happened next, to the work and the working relationship.'],
    example: {
      s: 'A colleague wanted to poll for job progress in the UI, and I thought server-sent events would be better.',
      t: 'We had to agree an approach so the feature could be built that week.',
      a: 'I asked what worried them about events, and they said the extra infrastructure and reconnection handling. They had a fair point. I built a small spike of each in an afternoon and we compared complexity and latency together. Events were noticeably simpler to consume on the client, and the reconnection cost was a few lines. We agreed on events with polling as a documented fallback.',
      r: 'The feature shipped on time. My colleague wrote the fallback, and we used the same spike-first approach for the next two disagreements.',
    },
    avoid: 'Avoid “I convinced them”. Say what you both learned and how you reached a decision together.',
    followUps: ['What if they had not agreed?', 'Who would have decided?', 'Would you do it the same way now?'],
  }),
  Q('Tell me about a time you disagreed with your manager or a product decision.', {
    checking: 'Whether you will speak up respectfully, and whether you can disagree and then commit.',
    shape: ['What the decision was and why you were concerned.', 'How you raised it: privately, with data, with a proposal.', 'What the outcome was.', 'How you acted afterwards, especially if you did not get your way.'],
    example: {
      s: 'Product wanted to launch a redesigned checkout to all users at once.',
      t: 'I was worried about conversion and no rollback plan.',
      a: 'I asked for ten minutes with the product manager and brought two numbers: how often our last big UI change had needed a hotfix, and what an hour of checkout downtime cost. I proposed rolling it out to 10% of users behind a flag first. They preferred a faster launch but agreed to 25% for two days.',
      r: 'The 25% rollout caught a validation bug affecting one card type. We fixed it before it reached everyone, and the product manager now asks for staged rollouts by default.',
    },
    avoid: 'Do not describe going over someone’s head, or complaining about the decision after it was made.',
    followUps: ['What if they had refused completely?', 'Did you ever commit to a decision you disagreed with?', 'How do you decide when something is worth pushing on?'],
  }),
  Q('Tell me about a difficult stakeholder.', {
    checking: 'Empathy and influence. Difficulty usually comes from a mismatch of goals or information.',
    shape: ['What made the working relationship hard, described neutrally.', 'What you did to understand **their goal**.', 'What changed in how you worked together.', 'The outcome for the project.'],
    example: {
      s: 'A sales lead kept asking for urgent custom changes on behalf of one customer.',
      t: 'I needed to protect the roadmap without damaging the relationship.',
      a: 'I asked for a regular fifteen-minute slot instead of ad-hoc messages, and began each by asking what the customer was trying to achieve. Often there was an existing feature that did it, or a smaller change. I wrote down each request with an estimate and let them choose the trade-off against planned work.',
      r: 'Urgent interruptions fell by about two thirds, and the sales lead started bringing the goal rather than the solution.',
    },
    avoid: 'Do not describe the person as unreasonable or impossible.',
    followUps: ['What did they care about most?', 'What would you do if the pressure came from your own manager?', 'How did you say no?'],
  }),
  Q('Tell me about a time you gave someone difficult feedback.', {
    checking: 'Courage and care. Whether you give feedback early, specifically and kindly.',
    shape: ['The behaviour and why it mattered, with a concrete instance.', 'How you prepared and how you delivered it (privately, soon after).', 'How the person responded.', 'What changed.'],
    example: {
      s: 'A teammate’s pull requests were regularly very large and hard to review.',
      t: 'I was reviewing most of them and it was slowing the team.',
      a: 'I asked for a quick call rather than commenting in the review. I gave a specific example: the last PR had taken me two hours to review and I had missed a bug. I asked how they were seeing it, and they said they did not know how to split work up. We went through the last change and I showed how to split it by behaviour.',
      r: 'Their next PRs were a third of the size, reviews took minutes, and they later helped a newer teammate do the same.',
    },
    avoid: 'Do not describe feedback delivered in a public review comment or in anger, and do not frame it as the person’s character.',
    followUps: ['How did they react at first?', 'What if it had not changed?', 'Have you given feedback upward?'],
  }),
  Q('Tell me about feedback you received that was hard to hear.', {
    checking: 'Humility and whether you actually change your behaviour.',
    shape: ['What the feedback was and who gave it.', 'Your honest first reaction.', 'What you did with it.', 'The change that others noticed.'],
    example: {
      s: 'In a review, my lead said I jumped to solutions and did not let others finish their ideas.',
      t: 'I had not noticed and I was surprised.',
      a: 'I asked for examples and recognised the pattern in design meetings. I started waiting for others to finish, asking a question first, and writing my suggestion after hearing two other views. I asked my lead to tell me in the moment if it happened again.',
      r: 'In the next review my lead said design discussions were noticeably broader, and one of my quieter teammates started proposing designs.',
    },
    avoid: 'Do not offer a fake weakness such as “I care too much”. Pick a real one with a real change.',
    followUps: ['Do you agree with it?', 'How do you ask for feedback now?', 'What feedback have you not acted on?'],
  }),
  RAPID('Rapid-fire: working with people', [
    ['Someone is wrong in a design review.', 'Ask a question that exposes the issue, then show evidence. Never correct in front of the room for sport.'],
    ['You disagree after a decision is made.', 'Say so once with evidence, then commit and help it succeed.'],
    ['A teammate is struggling.', 'Ask privately what is blocking them, offer to pair, and tell their manager only if it persists.'],
    ['Two teams want opposite things from you.', 'Bring them together, show the trade-off, and let the owner decide.'],
    ['You were wrong.', 'Say so immediately and say what you will change.'],
    ['What do interviewers want to hear about conflict?', 'Evidence, fairness to the other person, and a working relationship afterwards.'],
  ]),
];
