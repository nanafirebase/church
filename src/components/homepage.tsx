import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const topics = ["Jesus", "God", "Holy Spirit", "Bible", "Prayer", "Salvation", "Faith", "Doubt"];

const questions = [
  {
    category: "Faith & doubt",
    title: "Is it wrong to have doubts about my faith?",
    replies: 34,
  },
  {
    category: "Bible",
    title: "How do I read passages that feel difficult or confusing?",
    replies: 21,
  },
  {
    category: "Prayer",
    title: "What should I do when prayer feels like silence?",
    replies: 47,
  },
];

const references = ["John 10:30", "Luke 22:42", "John 1:1", "John 1:14", "John 6:38", "John 10:18", "John 20:28"];

export function Homepage() {
  const [question, setQuestion] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [promptStatus, setPromptStatus] = useState("");

  const submitQuestion = () => {
    if (!question.trim()) {
      setPromptStatus("Start with the question on your mind.");
      return;
    }
    setPromptStatus("Your question is ready. Sign in to share it with the community.");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-2.5" aria-label="Unfold Jesus home">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="size-4.5" aria-hidden="true" />
            </span>
            <span className="truncate font-display text-xl font-semibold">Unfold Jesus</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="Main navigation">
            <a className="transition-colors hover:text-foreground" href="#explore">Explore</a>
            <a className="transition-colors hover:text-foreground" href="#featured">Featured</a>
            <a className="transition-colors hover:text-foreground" href="#community">Community</a>
            <Button asChild variant="ghost" size="lg"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="lg"><Link to="/auth?mode=signup">Get started <ArrowRight /></Link></Button>
          </nav>

          <div className="hidden items-center gap-2 md:hidden">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
          </div>

          <Button
            className="md:hidden"
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
            <nav className="border-t border-border bg-background px-4 py-4 md:hidden" aria-label="Mobile navigation">
            <div className="mx-auto grid max-w-7xl gap-1">
              {[['Explore', '#explore'], ['Featured', '#featured'], ['Community', '#community']].map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-medium hover:bg-muted">
                  {label}<ChevronRight className="size-4 text-muted-foreground" />
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" className="flex-1" size="lg"><Link to="/auth">Sign in</Link></Button>
                <Button asChild className="flex-1" size="lg"><Link to="/auth?mode=signup">Get started</Link></Button>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="relative border-b border-border">
          <div className="absolute inset-x-0 top-0 h-1 bg-brand-stripe" aria-hidden="true" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)] lg:items-center lg:gap-20 lg:px-8 lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground">
                <span className="h-px w-8 bg-accent" /> A thoughtful place for honest faith
              </div>
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
                Bring your questions.<br /><span className="text-primary">Open Scripture.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Explore questions about Jesus, faith, and the Bible with clear explanations rooted in Scripture—without pressure or judgment.
              </p>
              <div className="mt-7 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex -space-x-2" aria-hidden="true">
                  {["bg-avatar-one", "bg-avatar-two", "bg-avatar-three"].map((color) => <span key={color} className={cn("size-8 rounded-full border-2 border-background", color)} />)}
                </span>
                <span><strong className="text-foreground">A growing community</strong> asking with courage</span>
              </div>
            </div>

            <div id="ask" className="scroll-mt-28 border border-border bg-card p-5 shadow-card sm:p-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="size-4" /> No question is too difficult to ask
              </div>
              <label htmlFor="question" className="mt-5 block font-display text-2xl font-semibold">What’s on your mind?</label>
              <div className="mt-4 border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
                <textarea
                  id="question"
                  value={question}
                  onChange={(event) => { setQuestion(event.target.value.slice(0, 280)); setPromptStatus(""); }}
                  className="min-h-32 w-full resize-none bg-transparent p-4 text-base leading-7 outline-none placeholder:text-muted-foreground"
                  placeholder="Why did Jesus…? What does this passage mean?"
                  aria-describedby="question-help question-status"
                />
                <div className="flex items-center justify-between border-t border-border px-3 py-2">
                  <span id="question-help" className="text-xs text-muted-foreground">{question.length}/280</span>
                  <Button size="sm" onClick={submitQuestion}>Ask <Send /></Button>
                </div>
              </div>
              <p id="question-status" aria-live="polite" className="mt-3 min-h-5 text-sm text-muted-foreground">
                {promptStatus || "You can choose to post anonymously after signing in."}
                {promptStatus.includes("Sign in") && (
                  <Link to="/auth" className="ml-1 font-semibold text-primary hover:underline">Sign in to post</Link>
                )}
              </p>
            </div>
          </div>
        </section>

        <section id="explore" className="scroll-mt-24 border-b border-border bg-secondary/55 py-10 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 sm:flex sm:items-end sm:justify-between">
              <div><p className="section-label">Explore by topic</p><h2 className="mt-2 font-display text-3xl font-semibold">Start where you are</h2></div>
              <a href="#community" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">See all questions <ArrowRight className="size-4" /></a>
            </div>
            <div className="no-scrollbar -mx-4 mt-7 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {topics.map((topic, index) => (
                <a key={topic} href="#community" className={cn("flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors", index === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40 hover:text-primary")}>{topic}</a>
              ))}
            </div>
          </div>
        </section>

        <section id="featured" className="scroll-mt-24 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="section-label">Featured question</p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">If Jesus is God, why did He pray to God?</h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">A sincere question about Jesus’ identity, humanity, and relationship with the Father.</p>
            </div>

            <article className="mt-10 grid border-y border-border lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
              <div className="bg-primary p-6 text-primary-foreground sm:p-10 lg:p-12">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/70"><BookOpen className="size-4" /> Open Scripture</span>
                  <button onClick={() => setSaved((value) => !value)} className="grid size-11 cursor-pointer place-items-center rounded-full border border-primary-foreground/25 transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground" aria-label={saved ? "Remove bookmark" : "Bookmark question"}>
                    <Bookmark className={cn("size-4", saved && "fill-current")} />
                  </button>
                </div>
                <p className="mt-10 font-display text-2xl leading-9 sm:text-3xl sm:leading-10">“I and the Father are one.”</p>
                <p className="mt-3 text-sm text-primary-foreground/70">John 10:30</p>
                <div className="mt-10 flex flex-wrap gap-2">
                  {references.map((reference) => <span key={reference} className="rounded-full border border-primary-foreground/20 px-3 py-1.5 text-xs text-primary-foreground/80">{reference}</span>)}
                </div>
                <p className="mt-6 text-xs leading-5 text-primary-foreground/60">Bible text shown from John 10:30. Open each reference in your preferred Bible translation for its full context.</p>
              </div>

              <div className="bg-card p-6 sm:p-10 lg:p-12">
                <div className="border-b border-border pb-8">
                  <p className="section-label">Explanation</p>
                  <p className="mt-4 text-lg leading-8 text-card-foreground">
                    Christians understand Jesus as fully divine and fully human. His prayers show a real relationship with the Father and the faithful human life He chose to live—not that He was less than God.
                  </p>
                  {expanded && (
                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                      In Luke 22, Jesus brings real anguish and obedience to the Father. In John’s Gospel, He also speaks of unity with the Father, His divine origin, and His willing mission. Read together, these passages hold both truths in view: Jesus shares God’s nature and genuinely lived among us as a human being.
                    </p>
                  )}
                  <Button className="mt-6 px-0" variant="link" onClick={() => setExpanded((value) => !value)}>
                    {expanded ? "Show less" : "Continue reading"}<ChevronDown className={cn("transition-transform", expanded && "rotate-180")} />
                  </Button>
                </div>
                <div className="pt-8">
                  <p className="section-label text-support">Interpretation</p>
                  <p className="mt-4 leading-7 text-muted-foreground">
                    This explanation reflects historic Trinitarian Christian belief. The Trinity is a profound mystery, and Christians may emphasize different aspects while agreeing that Jesus’ prayers were genuine—not a performance.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Heart className="size-4" /> 128 helpful</span>
                    <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-4" /> 26 responses</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="community" className="scroll-mt-24 border-y border-border bg-secondary/55 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:flex sm:items-end sm:justify-between">
              <div><p className="section-label">From the community</p><h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Questions worth exploring</h2></div>
              <Button variant="outline"><Search /> Browse all</Button>
            </div>
            <div className="mt-8 divide-y divide-border border-y border-border">
              {questions.map((item, index) => (
                <a key={item.title} href="#ask" className="group grid min-h-32 grid-cols-[minmax(0,1fr)_auto] items-center gap-5 py-6 sm:px-4">
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-accent-foreground">{item.category}</span>
                    <h3 className="mt-2 font-display text-xl font-semibold leading-7 group-hover:text-primary sm:text-2xl">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.replies} thoughtful responses</p>
                  </div>
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background transition-transform group-hover:translate-x-1", index === 0 && "border-accent bg-accent text-accent-foreground")}><ArrowRight className="size-4" /></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-support-soft text-support"><BookOpen /></span>
            <h2 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">Questions can be the beginning of deeper faith.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Ask honestly. Read carefully. Make room for understanding—and for one another.</p>
            <Button asChild className="mt-8" size="lg"><Link to="/auth?mode=signup">Join the community <ArrowRight /></Link></Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 text-sm text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-end sm:px-6 lg:px-8">
          <div><p className="font-display text-xl font-semibold text-foreground">Unfold Jesus</p><p className="mt-2 max-w-md leading-6">Questions about Jesus. Answers from Scripture. Explained simply.</p></div>
          <p>Built for questions, not quick judgments.</p>
        </div>
      </footer>
    </div>
  );
}