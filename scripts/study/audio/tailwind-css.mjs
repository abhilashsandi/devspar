// Audio overview of the Tailwind and CSS guide. Written to be heard, not read: plain sentences, no code, no lists.
export default {
  intro: `This is the audio overview of the Tailwind and CSS guide. Interviewers who ask about Tailwind are usually checking two things at once. Do you know the tool, and do you understand the CSS underneath it? A utility class is only a short name for a CSS rule, so the fundamentals come first, and they are also the easiest part to learn by listening.

There are ten sections. What changed in version four, CSS fundamentals, Flexbox and Grid, responsive design, Tailwind's core ideas, variants, customising the theme, performance and good practice, and two deep dives: one on layout and the cascade, one on design systems.

As with any fast moving tool, say which version you are talking about.`,

  chapters: {
    v4: `Section one is what changed in Tailwind version four. The idea is the same, utility classes, but the plumbing is different, and interviewers now expect you to know both.

The big move is that configuration went into CSS. In version three you had a JavaScript configuration file, a list of paths to scan, and three directives at the top of your stylesheet. In version four you import Tailwind with a single line in your CSS, it finds your source files automatically, and most projects need no configuration file at all.

Design tokens are declared in a theme block inside the stylesheet, as CSS variables. Each variable name sits in a namespace, and the namespace decides which utilities exist. So adding a colour variable creates the matching background, text and border classes. And because the tokens are ordinary CSS variables, you can read them anywhere in your own CSS as well.

Custom classes changed too. The utility directive defines a class of your own that works with all the variants, such as hover and the breakpoints. It replaces the older way of adding to the utilities and components layers. The custom variant directive defines when a prefix of your own applies, with a selector or a media query. Apply still exists, for composing utilities inside a CSS rule.

When you describe an upgrade, mention that there is an official upgrade tool, that some utilities were renamed, and that version four targets modern browsers, so check your browser support before you move.`,

    s1: `Section two is CSS fundamentals, which is what a utility class is really doing.

The box model first. Every element is a box: content, then padding, then border, then margin. With the content box setting, the width you give is the content alone, and padding and border are added on top. With border box, the width includes padding and border. So a box that is two hundred pixels wide with twenty pixels of padding still renders at two hundred. Tailwind sets border box everywhere.

Specificity is a score. Inline styles beat ids, ids beat classes, and classes beat element names. The higher score wins regardless of order, and when scores are equal, the later rule wins. Utility classes all have the same low specificity, which is why they are predictable.

For units, an em is relative to the font size of its own element, so it compounds when nested. A rem is relative to the root font size only, so it means the same everywhere.

Why does a z index sometimes not work? Because it only competes inside the same stacking context. A child with an enormous z index can never appear above something outside its parent's context, if that parent sits lower.

Custom properties are real CSS values that live in the page. They cascade, inherit and can change at run time. Sass variables are replaced at build time and do not exist in the browser.

Two more. Among the newer selectors, where adds no specificity, and has lets a parent be styled by what it contains. And clamp takes a minimum, a preferred value and a maximum, which gives you fluid type with no breakpoints.`,

    s2: `Section three is Flexbox and Grid, and the question is always when to use which.

Flexbox is one dimensional. It lays items out along a single row or a single column, and it is driven by the content: items take the space they need, and the leftover space is shared out. It is right for a navigation bar, a group of buttons, or a row with an icon and some text.

Grid is two dimensional. You define rows and columns, and place items into them. It is driven by the layout, not the content. It is right for page structure, galleries of cards, and anything where things must line up in both directions.

A good way to say it: use Flexbox when the content should decide the layout, and Grid when the layout should decide where the content goes. And they combine. A grid of cards, where each card is a small flex column, is completely normal.

Tailwind's utilities are thin names for the underlying properties. The justify classes set alignment along the main axis. The items classes set alignment along the cross axis. Gap sets the space between items. There are classes for direction, for wrapping, and for letting one item grow to fill the remaining space.

The standard exercise is a responsive grid that goes from one column, to two, to four. You write the single column class with no prefix, then the two column class with the medium prefix, then the four column class with the large prefix. Each breakpoint only overrides what changes above it.`,

    s3: `Section four is responsive design, in two ideas.

The first is mobile first. Your base styles, the classes with no prefix, target the smallest screen. Each breakpoint prefix then adds an override for that size and up. This is the point people get wrong. The medium prefix does not mean only on medium screens. It means medium and wider. So you design the phone layout first, and then add what changes as the screen grows. Reading a class list from left to right tells the story of the layout getting wider.

The reason this order works is practical. The phone layout is usually the simplest one, a single column. Adding complexity as space appears is easier than removing it as space disappears.

The second idea is the container query. A media query responds to the size of the viewport. A container query responds to the size of a particular containing element, whatever the viewport is.

Why does that matter? Think of a card component. In a wide main column it should show its image beside its text. In a narrow sidebar, on the very same screen, it should stack them. A media query cannot tell those two cases apart, because the viewport is the same. A container query can, because the card asks how wide its own container is. That lets a component carry its responsive behaviour with it, wherever it is placed.

Tailwind version four has container queries built in. You mark an element as a container, and then use container based prefixes on the elements inside it.`,

    s4: `Section five is Tailwind's core concepts.

Utility first means that instead of inventing a class name, such as card or primary button, and writing custom CSS for it, you apply small single purpose classes directly in the markup. That solves real problems. You stop inventing names. Your stylesheet stops growing with every feature, because the same utilities are reused. And changing one element cannot break another, since there is no shared rule to edit.

The honest objection is that the markup looks crowded. The answer is components. You do not repeat a long class list in fifty places. You write the button once as a component.

How does Tailwind ship only the CSS you use? It never includes every possible utility. It scans your source files for strings that look like class names, and generates CSS only for the ones it finds. Version four finds your files automatically.

That scanning explains a famous bug, and a quiz question. If you build a class name by gluing pieces together, such as a background prefix, then a colour held in a variable, then a shade, no style appears. The scanner does a plain text search for complete class names. It never runs your code, so it never sees the finished name. The fix is to write the full class names out, for example in a lookup object that maps each option to its complete class.

Finally, arbitrary values. Square bracket syntax lets you use a one off value from outside the design scale. Treat it as an escape hatch, not a habit. If you use the same value three times, it should be a token.`,

    s5: `Section six is variants, the prefixes that say when a utility applies.

Hover and focus apply a utility only while that element itself is in that state. Group hover is different. You mark an ancestor as a group, and a child then changes when the ancestor is hovered. That is how a whole card can highlight its title when the pointer is anywhere on the card.

Peer is the sibling version. Mark an input as a peer, and a later sibling, such as an error message, can react to the input's state, for example being invalid or focused. This gives you form feedback with no JavaScript.

Dark mode is a variant like any other. The style applies when dark mode is on, and there are two ways to turn it on. The default follows the operating system's preference. The other is to toggle it yourself, with a class or a data attribute on the root element, which you need if the site has its own theme switch. If you toggle it yourself, set the theme before the page first paints, or people will see a flash of the wrong one.

Beyond those, there are variants for structure and for attributes. Has styles a parent by what it contains. Data and aria variants style an element by its attributes.

The guide's advice for component libraries is to prefer the data and aria variants. The same attribute then drives the behaviour, the accessibility and the styling, so they cannot drift apart. An expanded menu is announced as expanded and looks expanded because of one attribute.

And variants stack. You can combine a breakpoint, dark mode and hover on a single utility.`,

    s6: `Section seven is customisation and theming.

Start with apply. It lets you compose several existing utilities into one custom class, inside a CSS file. It looks like the answer to long class lists, and it is usually not. Reach for it when the same long string is truly repeated and you cannot make a component, for example when styling markup you do not control, such as content from a rich text editor. If you can make a component, do that instead, because apply brings back the problems of named CSS classes: you have to invent names, and a change in one place affects everything that uses it.

Extending the theme. In version four you declare theme variables in a theme block in your CSS. Each variable both creates utilities and is exposed as an ordinary CSS custom property. New variables are added alongside the defaults, so you keep the built in palette and spacing scale unless you choose to reset them.

The version three equivalent has a trap, and it is a quiz question in the guide. In the JavaScript configuration, if you define colours directly under the theme key, you replace the entire default palette with only what you defined. Every built in colour is gone. To add to the defaults, you put your values under the extend key.

So the sentence to remember is: extend adds, and defining directly replaces.

A good theme also uses semantic names. A token called brand, or surface, says what the colour is for, and that makes a redesign or a dark theme a change to the tokens and not to every component.`,

    s7: `Section eight is performance and good practice.

Why does the production stylesheet stay small however large the app grows? Because of the scanning model. The final CSS contains only the utility classes that actually appear as text somewhere in your source. And utilities are reused. The hundredth component mostly uses classes that the first ninety nine already used, so it adds almost nothing. A traditional stylesheet grows with every feature. A utility stylesheet levels off.

Next, a design question. You have the same long class list in many places. Do you extract a component, or use apply? Both stop the repetition. But a component keeps the styling next to the markup, and it gives you a real interface: a button with a variant and a size, which can also carry behaviour and accessibility. Apply gives you only a class name. So in a component framework, the component is nearly always the better answer.

Then there is the problem of conditional classes. Building a class string by hand, with string concatenation and inline conditions, is error prone. You get missing spaces, and you get conflicts, where two classes set the same property and it is not obvious which wins. The fix is a small helper library. One kind builds a class string from conditions. Another kind understands Tailwind and resolves conflicts, so that the last class in a group wins.

Add two habits to that. Use an automatic class sorter, so class order is the same everywhere and diffs stay small. And keep one-off values rare, so the design scale stays meaningful.`,

    'deep-layout': `The first deep dive is layout and the cascade.

Cascade layers let you decide which group of styles wins before specificity is even compared. You name layers in an order, and a rule in a later layer beats a rule in an earlier one, even if the earlier selector is more specific. That ends the old arms race of ever more specific selectors. Tailwind version four is built on layers: the theme, then base styles, then components, then utilities. That is why a utility class reliably overrides a component style. One consequence to know: styles that are not in any layer beat all layered styles, which can surprise you when you bring in third party CSS.

Then Grid in depth. A track sized with a minimum of two hundred and twenty pixels and a maximum of one fraction means: at least that wide, and share the leftover space. Combine that with automatic repetition and you get a grid that picks its own number of columns, with no breakpoints at all. There are two flavours. Auto fill keeps empty columns when there are few items, so the items stay at their size. Auto fit collapses the empty columns, so the items stretch to fill the row. Template areas let you name regions, such as header, sidebar and main, and draw the layout as a small map.

Finally, subgrid. Nested grids normally define their own tracks, so the content inside sibling cards cannot line up. With subgrid, a child grid reuses its parent's tracks. The classic use is a row of cards where the titles, the text and the buttons all align across the cards, whatever the length of the content.`,

    'deep-ds': `The second deep dive is about design systems: building components that many people will use.

Variant driven components rest on three small tools. The first builds a class string from conditions, so you can say include this class when the button is disabled. The second understands Tailwind and resolves conflicts, so that the last class in a group wins. If a component sets horizontal padding and the person using it passes in a general padding class, the result is the one they passed, and not a tangle of both. These two are usually wrapped together in one small helper. The third tool declares variants. You state the base classes, then the options, such as intent and size, the classes for each option, and the defaults. Out comes a function that turns props into the right class string, with types for the allowed values.

That gives a component with a clear interface: a button with a variant and a size, and nobody needs to remember which classes go together.

Then themes at run time: light, dark, and perhaps a brand theme for each customer. The approach is CSS variables with semantic names. You name tokens for their role, such as surface, ink and brand, not for their colour. Components use only those names. A theme is then nothing more than a different set of values for the variables, applied by a class or an attribute on the root element. Components never change when a theme is added. Only the variables do.

Tailwind version four supports this directly. The theme can point its tokens at your variables, so a background surface class follows whichever theme is active.`,
  },
};
